import json
import os
import re
import unicodedata

with open(os.path.join(os.path.dirname(__file__), "..", "data", "terms.json"), encoding="utf-8") as f:
    _RAW = json.load(f)

SYSTEMS = list(_RAW.keys())
ALL_TERMS = [{**entry, "system": system} for system, entries in _RAW.items() for entry in entries]
BY_CODE = {t["namasteCode"]: t for t in ALL_TERMS}


def _norm(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in text if not 0x300 <= ord(c) <= 0x36F).strip()


def _words(text: str) -> list[str]:
    return [w for w in re.split(r"[^a-z0-9\u0900-\u097f]+", _norm(text)) if w]


def _within_one_edit(a: str, b: str) -> bool:
    if abs(len(a) - len(b)) > 1:
        return False
    i = j = edits = 0
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            i += 1
            j += 1
            continue
        edits += 1
        if edits > 1:
            return False
        if len(a) > len(b):
            i += 1
        elif len(b) > len(a):
            j += 1
        else:
            i += 1
            j += 1
    return edits + (len(a) - i) + (len(b) - j) <= 1


def _keyword_matches(keyword: str, text: str, text_words: list[str]) -> bool:
    k = _norm(keyword)
    if " " in k:
        return k in text
    if len(k) <= 3:
        return any(w in (k, k + "s") for w in text_words)
    return any(
        w.startswith(k) or (len(k) >= 5 and len(w) >= 5 and _within_one_edit(w, k))
        for w in text_words
    )


def public(term: dict) -> dict:
    return {
        "term": term["term"],
        "system": term["system"],
        "namasteCode": term["namasteCode"],
        "icd11Code": term["icd11Code"],
        "icd11Label": term["icd11Label"],
    }


def search(query: str = "", system: str | None = None, limit: int = 50) -> list[dict]:
    pool = [t for t in ALL_TERMS if system is None or t["system"] == system]
    q = _norm(query)
    if not q:
        return [public(t) for t in pool[:limit]]
    scored = []
    for t in pool:
        name = _norm(t["term"])
        if name.startswith(q):
            score = 100
        elif any(w.startswith(q) for w in _words(t["term"])):
            score = 80
        elif q in name:
            score = 60
        elif any(q in _norm(x) for x in (t["icd11Label"], t["namasteCode"], t["icd11Code"], t["system"])):
            score = 40
        elif any(q in _norm(s) for s in t["symptoms"]):
            score = 20
        else:
            continue
        scored.append((score, t))
    scored.sort(key=lambda x: -x[0])
    return [public(t) for _, t in scored[:limit]]


def suggest(text: str, limit: int = 3) -> list[dict]:
    t = _norm(text)
    if len(t) < 3:
        return []
    text_words = _words(t)
    results = []
    for term in ALL_TERMS:
        matched = [s for s in term["symptoms"] if _keyword_matches(s, t, text_words)]
        score = sum(0.5 if s == "fever" else 1 for s in matched)
        if score >= 1:
            results.append((score, {**public(term), "matchedSymptoms": matched}))
    results.sort(key=lambda x: -x[0])
    return [r for _, r in results[:limit]]
