import json
import os
import sqlite3
import uuid
from contextlib import closing
from datetime import datetime, timezone

from .security import hash_password

DB_PATH = os.environ.get("SETU_DB", os.path.join(os.path.dirname(__file__), "..", "setu.db"))

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  doctor_id TEXT PRIMARY KEY, name TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS encounters (
  id TEXT PRIMARY KEY, doctor_id TEXT NOT NULL, abha_id TEXT NOT NULL, patient_name TEXT,
  system TEXT, term TEXT, namaste_code TEXT NOT NULL, icd_code TEXT NOT NULL,
  bundle TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, method TEXT NOT NULL,
  path TEXT NOT NULL, status INTEGER NOT NULL, latency_ms INTEGER NOT NULL
);
"""


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(connect()) as conn:
        conn.executescript(SCHEMA)
        conn.commit()
    demo_password = os.environ.get("SETU_DEMO_PASSWORD", "setu@123")
    add_user("DOC-9831-ABDM", "Dr. Ramesh Iyer", demo_password, only_if_missing=True)


def add_user(doctor_id: str, name: str, password: str, only_if_missing: bool = False) -> None:
    with closing(connect()) as conn:
        exists = conn.execute("SELECT 1 FROM users WHERE doctor_id = ?", (doctor_id,)).fetchone()
        if exists and only_if_missing:
            return
        salt, digest = hash_password(password)
        conn.execute(
            "INSERT OR REPLACE INTO users (doctor_id, name, salt, password_hash) VALUES (?, ?, ?, ?)",
            (doctor_id, name, salt, digest),
        )
        conn.commit()


def get_user(doctor_id: str):
    with closing(connect()) as conn:
        return conn.execute("SELECT * FROM users WHERE doctor_id = ?", (doctor_id,)).fetchone()


def write_log(method: str, path: str, status: int, latency_ms: int) -> None:
    with closing(connect()) as conn:
        conn.execute(
            "INSERT INTO logs (ts, method, path, status, latency_ms) VALUES (?, ?, ?, ?, ?)",
            (datetime.now().isoformat(timespec="seconds"), method, path, status, latency_ms),
        )
        conn.commit()


def recent_logs(limit: int = 30) -> list[dict]:
    with closing(connect()) as conn:
        rows = conn.execute("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [
        {
            "time": r["ts"][11:19],
            "method": r["method"],
            "endpoint": r["path"],
            "status": r["status"],
            "latencyMs": r["latency_ms"],
        }
        for r in rows
    ]


def save_encounter(doctor_id: str, body: dict, bundle: dict) -> str:
    encounter_id = str(uuid.uuid4())
    with closing(connect()) as conn:
        conn.execute(
            "INSERT INTO encounters (id, doctor_id, abha_id, patient_name, system, term, namaste_code, icd_code, bundle, created_at)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                encounter_id, doctor_id, body["abhaId"], body.get("patientName"), body.get("system"),
                body.get("term"), body["namasteCode"], body["icd11Code"], json.dumps(bundle),
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
            ),
        )
        conn.commit()
    return encounter_id


def list_encounters(limit: int = 50) -> list[dict]:
    with closing(connect()) as conn:
        rows = conn.execute("SELECT * FROM encounters ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    return [
        {
            "id": r["id"],
            "patientId": r["abha_id"],
            "name": r["patient_name"] or "Unknown Patient",
            "term": r["term"],
            "namaste": r["namaste_code"],
            "icd": r["icd_code"],
            "system": r["system"],
            "createdAt": r["created_at"],
        }
        for r in rows
    ]


def stats() -> dict:
    with closing(connect()) as conn:
        total = conn.execute("SELECT COUNT(*) FROM encounters").fetchone()[0]
        calls = conn.execute("SELECT COUNT(*) FROM logs").fetchone()[0]
        failed = conn.execute("SELECT COUNT(*) FROM logs WHERE status >= 400").fetchone()[0]
        avg = conn.execute("SELECT AVG(latency_ms) FROM logs").fetchone()[0]
    return {
        "totalExaminations": total,
        "apiCalls": calls,
        "failedRequests": failed,
        "successRate": round(100 * (calls - failed) / calls, 2) if calls else None,
        "avgLatencyMs": round(avg) if avg is not None else None,
    }
