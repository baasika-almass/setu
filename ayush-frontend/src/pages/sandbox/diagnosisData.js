import { CORE_TERMS_BY_SYSTEM } from "./coreTerms.js";
import { EXTRA_TERMS_BY_SYSTEM } from "./extraTerms.js";

// 50 common conditions per AYUSH system (sample terminology with demonstration codes).
// To use the official dataset, replace this object with the converted
// namaste_sample.json, keeping the same shape:
// { term, namasteCode, icdCode, icdLabel, symptoms: [...] }
export const DIAGNOSIS_TERMS_BY_SYSTEM = Object.fromEntries(
  Object.keys(CORE_TERMS_BY_SYSTEM).map((system) => [
    system,
    [...CORE_TERMS_BY_SYSTEM[system], ...(EXTRA_TERMS_BY_SYSTEM[system] ?? [])],
  ])
);
