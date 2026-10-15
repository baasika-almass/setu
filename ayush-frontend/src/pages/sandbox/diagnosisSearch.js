import { DIAGNOSIS_TERMS_BY_SYSTEM } from "./diagnosisData.js";

// Flat list: every term tagged with its AYUSH system.
export const ALL_TERMS = Object.entries(DIAGNOSIS_TERMS_BY_SYSTEM).flatMap(
  ([system, entries]) => entries.map((entry) => ({ ...entry, system }))
);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function words(text) {
  return normalize(text).split(/[^a-z0-9\u0900-\u097f]+/).filter(Boolean);
}

// True when two words differ by at most one edit (insert, delete or swap-free replace).
function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function keywordMatches(keyword, text, textWords) {
  const k = normalize(keyword);
  if (k.includes(" ")) return text.includes(k);
  if (k.length <= 3) return textWords.some((w) => w === k || w === k + "s");
  return textWords.some(
    (w) => w.startsWith(k) || (k.length >= 5 && w.length >= 5 && withinOneEdit(w, k))
  );
}

// Type-ahead by disease name, code or common word. Empty query lists the given system.
export function searchTerms(query, fallbackSystem) {
  const q = normalize(query || "");
  if (!q) return ALL_TERMS.filter((t) => t.system === fallbackSystem);

  return ALL_TERMS.map((entry) => {
    const term = normalize(entry.term);
    let score = 0;
    if (term.startsWith(q)) score = 100;
    else if (words(entry.term).some((w) => w.startsWith(q))) score = 80;
    else if (term.includes(q)) score = 60;
    else if (
      normalize(entry.icdLabel).includes(q) ||
      normalize(entry.namasteCode).includes(q) ||
      normalize(entry.icdCode).includes(q) ||
      normalize(entry.system).includes(q)
    )
      score = 40;
    else if (entry.symptoms.some((s) => normalize(s).includes(q))) score = 20;
    return { entry, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry)
    .slice(0, 8);
}

// Suggest likely terms from free-text symptoms. Returns up to 3 with the matched symptoms.
export function suggestFromSymptoms(text) {
  const t = normalize(text || "");
  if (t.length < 3) return [];
  const textWords = words(t);

  return ALL_TERMS.map((entry) => {
    const matched = entry.symptoms.filter((s) => keywordMatches(s, t, textWords));
    // "fever" alone matches many terms, so more specific matches should rank higher.
    const score = matched.reduce((sum, s) => sum + (s === "fever" ? 0.5 : 1), 0);
    return { entry, matched, score };
  })
    .filter((r) => r.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
