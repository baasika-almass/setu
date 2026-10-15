import uuid
from datetime import datetime, timezone

NAMASTE_SYSTEM = "http://setu.local/CodeSystem/namaste"
ICD11_SYSTEM = "http://id.who.int/icd/release/11/mms"
ABHA_SYSTEM = "https://healthid.ndhm.gov.in"


def build_bundle(body: dict, term: dict, doctor_id: str) -> dict:
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    patient_id, encounter_id, condition_id = (str(uuid.uuid4()) for _ in range(3))
    patient = {
        "resourceType": "Patient",
        "id": patient_id,
        "identifier": [{"system": ABHA_SYSTEM, "value": body["abhaId"]}],
    }
    if body.get("patientName"):
        patient["name"] = [{"text": body["patientName"]}]
    encounter = {
        "resourceType": "Encounter",
        "id": encounter_id,
        "status": "finished",
        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB"},
        "subject": {"reference": f"Patient/{patient_id}"},
        "participant": [{"individual": {"identifier": {"value": doctor_id}}}],
        "period": {"start": now, "end": now},
    }
    condition = {
        "resourceType": "Condition",
        "id": condition_id,
        "subject": {"reference": f"Patient/{patient_id}"},
        "encounter": {"reference": f"Encounter/{encounter_id}"},
        "code": {
            "coding": [
                {"system": NAMASTE_SYSTEM, "code": term["namasteCode"], "display": term["term"]},
                {"system": ICD11_SYSTEM, "code": term["icd11Code"], "display": term["icd11Label"]},
            ],
            "text": term["term"],
        },
    }
    return {
        "resourceType": "Bundle",
        "type": "collection",
        "timestamp": now,
        "entry": [{"resource": r} for r in (patient, encounter, condition)],
    }
