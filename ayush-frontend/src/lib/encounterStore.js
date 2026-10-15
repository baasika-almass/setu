const STORAGE_KEY = "namaste_encounters";

const SEED_ENCOUNTERS = [
  { patientId: "ramesh@abha", name: "Ramesh Patel", term: "Vata Jvara", namaste: "A_JV.1.1", icd: "SF82" },
  { patientId: "kiran@abha", name: "Kiran Sharma", term: "Śvāsa-Prasāda", namaste: "Y_SP.4.3", icd: "SF90" },
  { patientId: "vijay@abha", name: "Vijay Kumar", term: "Kaphaja Kasa", namaste: "A_KK.2.1", icd: "SF84" },
  { patientId: "sneha@abha", name: "Sneha Reddy", term: "Amlapitta", namaste: "A_AP.9.2", icd: "SF88" },
];

export function getEncounters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ENCOUNTERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_ENCOUNTERS;
  } catch {
    return SEED_ENCOUNTERS;
  }
}

export function addEncounter(entry) {
  try {
    const current = getEncounters();
    const next = [entry, ...current].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private browsing, etc.) — fail silently, demo still works.
  }
}
