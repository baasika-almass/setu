const STORAGE_KEY = "namaste_api_logs";

const SEED_LOGS = [
  { time: "09:41:12", method: "POST", endpoint: "/v1/fhir/StandardizedEncounter", status: 201, latencyMs: 210 },
  { time: "09:38:47", method: "POST", endpoint: "/v1/fhir/validate", status: 200, latencyMs: 165 },
  { time: "09:38:40", method: "POST", endpoint: "/v1/icd11/tm2/lookup", status: 200, latencyMs: 190 },
  { time: "09:38:35", method: "GET", endpoint: "/v1/namaste/terms", status: 200, latencyMs: 140 },
  { time: "09:38:30", method: "POST", endpoint: "/v1/abha/validate", status: 200, latencyMs: 155 },
  { time: "09:38:26", method: "GET", endpoint: "/v1/emr/handshake", status: 200, latencyMs: 120 },
];

export function getLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_LOGS;
  } catch {
    return SEED_LOGS;
  }
}

export function addLogs(entries) {
  try {
    const current = getLogs();
    const next = [...entries, ...current].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — fail silently, demo still works.
  }
}
