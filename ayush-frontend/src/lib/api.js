// Talks to the Setu backend when VITE_API_URL is set. Without it, the site runs in demo mode.
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const API_ENABLED = Boolean(BASE);

const TOKEN_KEY = "setu_token";
const DOCTOR_KEY = "setu_doctor";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export function getDoctor() {
  try {
    return JSON.parse(sessionStorage.getItem(DOCTOR_KEY));
  } catch {
    return null;
  }
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(DOCTOR_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Cannot reach the Setu server. Start the backend and try again.", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth) signOut();
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg || d).join("; ")
      : detail || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  return data;
}

export async function login(doctorId, password) {
  const data = await request("/v1/auth/session", { method: "POST", body: { doctorId, password }, auth: false });
  sessionStorage.setItem(TOKEN_KEY, data.accessToken);
  sessionStorage.setItem(DOCTOR_KEY, JSON.stringify(data.doctor));
  return data.doctor;
}

export const handshake = () => request("/v1/emr/handshake");
export const validateAbha = (abhaId) => request("/v1/abha/validate", { method: "POST", body: { abhaId } });
export const listTerms = (system) => request(`/v1/namaste/terms?system=${encodeURIComponent(system)}`);
export const lookupCode = (namasteCode) => request("/v1/icd11/tm2/lookup", { method: "POST", body: { namasteCode } });
export const validateEncounter = (body) => request("/v1/fhir/validate", { method: "POST", body });
export const saveEncounter = (body) => request("/v1/fhir/StandardizedEncounter", { method: "POST", body });
export const fetchEncounters = async () => (await request("/v1/encounters")).encounters;
export const fetchLogs = async () => (await request("/v1/logs")).logs;
export const fetchStats = () => request("/v1/stats");

export const ABHA_PATTERN = /^([A-Za-z0-9._-]{3,64}@(abha|abdm|sbx)|\d{2}-?\d{4}-?\d{4}-?\d{4})$/;
