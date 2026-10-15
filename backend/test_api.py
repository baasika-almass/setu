"""Quick end-to-end check:  python test_api.py"""
import os
import tempfile

os.environ["SETU_DB"] = os.path.join(tempfile.mkdtemp(), "test.db")
from fastapi.testclient import TestClient

from app.main import app

with TestClient(app) as c:
    assert c.get("/v1/namaste/terms").status_code == 401
    assert c.post("/v1/auth/session", json={"doctorId": "DOC-9831-ABDM", "password": "wrong"}).status_code == 401
    token = c.post("/v1/auth/session", json={"doctorId": "DOC-9831-ABDM", "password": "setu@123"}).json()["accessToken"]
    h = {"Authorization": f"Bearer {token}"}

    r = c.get("/v1/namaste/terms", params={"system": "Ayurveda"}, headers=h).json()
    assert r["count"] == 50, r["count"]
    assert c.get("/v1/namaste/terms", params={"q": "diab"}, headers=h).json()["count"] == 5
    s = c.post("/v1/namaste/suggest", json={"symptoms": "vomiting, stomach pain buring sensation"}, headers=h).json()
    assert s["suggestions"][0]["term"].startswith("Amlapitta"), s

    code = "A_AP.9.2"
    lk = c.post("/v1/icd11/tm2/lookup", json={"namasteCode": code}, headers=h).json()
    assert lk["icd11Code"] == "SF88"
    assert c.post("/v1/icd11/tm2/lookup", json={"namasteCode": "NOPE"}, headers=h).status_code == 404

    bad = {"abhaId": "x@abha", "namasteCode": code, "icd11Code": "WRONG"}
    assert c.post("/v1/fhir/StandardizedEncounter", json=bad, headers=h).status_code == 422
    good = {"abhaId": "sneha@abha", "namasteCode": code, "icd11Code": "SF88", "patientName": "Sneha Reddy"}
    e = c.post("/v1/fhir/StandardizedEncounter", json=good, headers=h)
    assert e.status_code == 201 and e.json()["bundle"]["resourceType"] == "Bundle"

    assert len(c.get("/v1/encounters", headers=h).json()["encounters"]) == 1
    assert len(c.get("/v1/logs", headers=h).json()["logs"]) > 5
    st = c.get("/v1/stats", headers=h).json()
    assert st["totalExaminations"] == 1 and st["failedRequests"] >= 3, st

    for _ in range(5):
        c.post("/v1/auth/session", json={"doctorId": "DOC-1", "password": "x"})
    assert c.post("/v1/auth/session", json={"doctorId": "DOC-1", "password": "x"}).status_code == 429
print("All backend checks passed")
