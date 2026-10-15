import os
import re
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import db, terms
from .fhir import build_bundle
from .security import create_token, verify_password, verify_token

ABHA_PATTERN = re.compile(r"^([A-Za-z0-9._-]{3,64}@(abha|abdm|sbx)|\d{2}-?\d{4}-?\d{4}-?\d{4})$")
FAILED_LOGINS: dict[str, list[float]] = {}
MAX_FAILURES, WINDOW_SECONDS = 5, 300


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Setu API", version="1.0.0", lifespan=lifespan)

origins = os.environ.get("SETU_CORS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/v1/") and path != "/v1/logs" and request.method != "OPTIONS":
        db.write_log(request.method, path, response.status_code, round((time.perf_counter() - start) * 1000))
    return response


def current_doctor(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    payload = verify_token(authorization[7:])
    if not payload:
        raise HTTPException(401, "Invalid or expired token")
    return payload


class SessionBody(BaseModel):
    doctorId: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=200)


class AbhaBody(BaseModel):
    abhaId: str


class SuggestBody(BaseModel):
    symptoms: str = Field(max_length=1000)


class LookupBody(BaseModel):
    namasteCode: str


class EncounterBody(BaseModel):
    abhaId: str
    namasteCode: str
    icd11Code: str
    patientName: str | None = Field(default=None, max_length=120)
    term: str | None = None
    system: str | None = None


def check_encounter(body: EncounterBody) -> tuple[list[str], dict | None]:
    issues = []
    if not ABHA_PATTERN.match(body.abhaId):
        issues.append("abhaId must look like name@abha or be a 14-digit ABHA number")
    term = terms.BY_CODE.get(body.namasteCode)
    if not term:
        issues.append(f"Unknown NAMASTE code {body.namasteCode}")
    elif term["icd11Code"] != body.icd11Code:
        issues.append(f"ICD-11 code does not match NAMASTE code (expected {term['icd11Code']})")
    return issues, term


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/auth/session")
def create_session(body: SessionBody):
    now = time.time()
    attempts = [t for t in FAILED_LOGINS.get(body.doctorId, []) if now - t < WINDOW_SECONDS]
    if len(attempts) >= MAX_FAILURES:
        raise HTTPException(429, "Too many failed attempts. Try again in a few minutes.")
    user = db.get_user(body.doctorId)
    if not user or not verify_password(body.password, user["salt"], user["password_hash"]):
        FAILED_LOGINS[body.doctorId] = attempts + [now]
        raise HTTPException(401, "Invalid Doctor ID or password")
    FAILED_LOGINS.pop(body.doctorId, None)
    return {
        "accessToken": create_token(user["doctor_id"], user["name"]),
        "tokenType": "bearer",
        "doctor": {"doctorId": user["doctor_id"], "name": user["name"]},
    }


@app.get("/v1/emr/handshake")
def handshake(_: dict = Depends(current_doctor)):
    return {"status": "active", "gateway": "Setu Sandbox Gateway"}


@app.post("/v1/abha/validate")
def validate_abha(body: AbhaBody, _: dict = Depends(current_doctor)):
    return {"abhaId": body.abhaId, "valid": bool(ABHA_PATTERN.match(body.abhaId))}


@app.get("/v1/namaste/terms")
def list_terms(
    system: str | None = None,
    q: str = "",
    limit: int = Query(default=50, ge=1, le=300),
    _: dict = Depends(current_doctor),
):
    if system and system not in terms.SYSTEMS:
        raise HTTPException(422, f"Unknown system. Choose one of: {', '.join(terms.SYSTEMS)}")
    results = terms.search(q, system, limit)
    return {"system": system, "count": len(results), "terms": results}


@app.post("/v1/namaste/suggest")
def suggest_terms(body: SuggestBody, _: dict = Depends(current_doctor)):
    return {"suggestions": terms.suggest(body.symptoms)}


@app.post("/v1/icd11/tm2/lookup")
def lookup(body: LookupBody, _: dict = Depends(current_doctor)):
    term = terms.BY_CODE.get(body.namasteCode)
    if not term:
        raise HTTPException(404, f"No mapping for NAMASTE code {body.namasteCode}")
    return terms.public(term)


@app.post("/v1/fhir/validate")
def validate(body: EncounterBody, _: dict = Depends(current_doctor)):
    issues, _term = check_encounter(body)
    return {"valid": not issues, "issues": issues}


@app.post("/v1/fhir/StandardizedEncounter", status_code=201)
def standardized_encounter(body: EncounterBody, doctor: dict = Depends(current_doctor)):
    issues, term = check_encounter(body)
    if issues or term is None:
        raise HTTPException(422, issues)
    payload = body.model_dump()
    payload["term"] = term["term"]
    payload["system"] = term["system"]
    bundle = build_bundle(payload, term, doctor["sub"])
    encounter_id = db.save_encounter(doctor["sub"], payload, bundle)
    return {"id": encounter_id, "status": "accepted", "bundle": bundle}


@app.get("/v1/encounters")
def encounters(limit: int = Query(default=50, ge=1, le=200), _: dict = Depends(current_doctor)):
    return {"encounters": db.list_encounters(limit)}


@app.get("/v1/logs")
def logs(limit: int = Query(default=30, ge=1, le=200), _: dict = Depends(current_doctor)):
    return {"logs": db.recent_logs(limit)}


@app.get("/v1/stats")
def get_stats(_: dict = Depends(current_doctor)):
    return db.stats()
