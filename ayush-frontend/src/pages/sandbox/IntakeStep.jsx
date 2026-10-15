import { useMemo, useState } from "react";
import { ShieldCheck, ArrowRight, Search, Check, Lightbulb } from "lucide-react";
import { DIAGNOSIS_TERMS_BY_SYSTEM } from "./diagnosisData.js";
import { searchTerms, suggestFromSymptoms } from "./diagnosisSearch.js";
import { ABHA_PATTERN } from "../../lib/api.js";

const AYUSH_SYSTEMS = Object.keys(DIAGNOSIS_TERMS_BY_SYSTEM);

const SECTIONS = [
  { number: 1, title: "Patient Demographics & ABHA Metadata" },
  { number: 2, title: "Clinical Symptomatology & Presentations" },
  { number: 3, title: "AYUSH System Selection & Codification Target" },
];

export default function IntakeStep({ onSubmit }) {
  const [form, setForm] = useState({
    abhaId: "",
    fullName: "",
    age: "",
    gender: "Male",
    complaints: "",
    system: "Ayurveda",
    diagnosisTerm: DIAGNOSIS_TERMS_BY_SYSTEM.Ayurveda[0].term,
  });
  const [error, setError] = useState("");
  const [query, setQuery] = useState(null); // null = not typing, show the chosen term
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => suggestFromSymptoms(form.complaints), [form.complaints]);
  const results = useMemo(() => searchTerms(query ?? "", form.system), [query, form.system]);

  function chooseEntry(entry) {
    setForm((prev) => ({ ...prev, system: entry.system, diagnosisTerm: entry.term }));
    setQuery(null);
    setOpen(false);
    setActiveIndex(0);
  }

  function handleComboKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && results[activeIndex]) {
      e.preventDefault();
      chooseEntry(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(null);
    }
  }

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "system") {
        next.diagnosisTerm = DIAGNOSIS_TERMS_BY_SYSTEM[value][0].term;
        setQuery(null);
      }
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.abhaId.trim() || !form.fullName.trim() || !form.age || !form.complaints.trim()) {
      setError("Fill in every field so the pipeline has a complete record to standardize.");
      return;
    }
    if (!ABHA_PATTERN.test(form.abhaId.trim())) {
      setError("Enter a valid ABHA address such as name@abha, or a 14-digit ABHA number.");
      return;
    }
    setError("");
    onSubmit({ ...form, abhaId: form.abhaId.trim() });
  }

  return (
    <form className="intake-card" onSubmit={handleSubmit} noValidate>
      <TimelineSection meta={SECTIONS[0]} isLast={false}>
        <div className="field-row">
          <Field label="ABHA Address / ID">
            <input
              className="field-input"
              type="text"
              placeholder="name@abha"
              value={form.abhaId}
              onChange={(e) => update("abhaId", e.target.value)}
            />
          </Field>
          <Field label="Full Name">
            <input
              className="field-input"
              type="text"
              placeholder="Patient full name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </Field>
        </div>

        <div className="field-row">
          <Field label="Age (Years)">
            <input
              className="field-input"
              type="number"
              min="0"
              placeholder="Age"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />
          </Field>
          <Field label="Gender">
            <div className="segmented">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={"segmented-option" + (form.gender === option ? " is-active" : "")}
                  onClick={() => update("gender", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </TimelineSection>

      <TimelineSection meta={SECTIONS[1]} isLast={false}>
        <Field label="Chief Complaints / Symptoms">
          <textarea
            className="field-input field-textarea"
            rows={4}
            placeholder="Describe the patient's symptoms, onset, and pattern…"
            value={form.complaints}
            onChange={(e) => update("complaints", e.target.value)}
          />
        </Field>

        {form.complaints.trim().length >= 3 && (
          <div className="suggest-box" aria-live="polite">
            <p className="suggest-heading">
              <Lightbulb size={15} strokeWidth={2} />
              {suggestions.length ? "Possible traditional diagnoses" : "No match yet"}
            </p>
            {suggestions.length === 0 && (
              <p className="suggest-empty">
                Add more detail, for example fever, burning, vomiting or cough, or search by
                name in step 3.
              </p>
            )}
            <ul className="suggest-list">
              {suggestions.map(({ entry, matched }) => {
                const selected = form.diagnosisTerm === entry.term && form.system === entry.system;
                return (
                  <li key={entry.namasteCode}>
                    <button
                      type="button"
                      className={"suggest-item" + (selected ? " is-selected" : "")}
                      onClick={() => chooseEntry(entry)}
                    >
                      <span className="suggest-main">
                        <strong>{entry.term}</strong>
                        <span className="suggest-meta">
                          {entry.system} · {entry.namasteCode}
                        </span>
                        <span className="suggest-why">Matches: {matched.join(", ")}</span>
                      </span>
                      <span className="suggest-action">
                        {selected ? (
                          <>
                            <Check size={14} strokeWidth={2.75} /> Selected
                          </>
                        ) : (
                          "Use this term"
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="suggest-note">
              Suggestions are keyword matches to help pick a term. The clinician confirms the
              final diagnosis.
            </p>
          </div>
        )}
      </TimelineSection>

      <TimelineSection meta={SECTIONS[2]} isLast>
        <Field label="Traditional Medicine System">
          <div className="pill-group">
            {AYUSH_SYSTEMS.map((system) => {
              const active = form.system === system;
              return (
                <button
                  key={system}
                  type="button"
                  className={"pill" + (active ? " is-active" : "")}
                  onClick={() => update("system", system)}
                >
                  {active && <Check size={13} strokeWidth={2.75} />}
                  {system}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Traditional Diagnosis Term">
          <div className="combo">
            <input
              className="field-input combo-input"
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="diagnosis-listbox"
              aria-autocomplete="list"
              placeholder="Type a disease name, code or symptom"
              value={query ?? form.diagnosisTerm}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onClick={() => setOpen(true)}
              onFocus={(e) => {
                setOpen(true);
                e.target.select();
              }}
              onBlur={() => {
                setOpen(false);
                setQuery(null);
              }}
              onKeyDown={handleComboKeyDown}
            />
            <Search className="select-icon" size={17} strokeWidth={1.75} />
            {open && (
              <ul className="combo-list" id="diagnosis-listbox" role="listbox">
                {results.length === 0 && (
                  <li className="combo-empty">
                    No matching term. Try a different spelling or another system.
                  </li>
                )}
                {results.map((entry, i) => (
                  <li
                    key={entry.system + entry.namasteCode}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={"combo-option" + (i === activeIndex ? " is-active" : "")}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseEntry(entry);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="combo-term">{entry.term}</span>
                    <span className="combo-meta">
                      {entry.system} · {entry.namasteCode}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>
      </TimelineSection>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="intake-footer">
        <p className="gateway-note">
          <ShieldCheck size={14} strokeWidth={2} />
          Direct FHIR lookup against National Registry database
        </p>
        <button className="submit-button" type="submit">
          Generate Standard Codes
          <ArrowRight size={17} strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}

function TimelineSection({ meta, isLast, children }) {
  return (
    <section className="timeline-section">
      <div className="timeline-rail">
        <span className="timeline-dot">{meta.number}</span>
        {!isLast && <span className="timeline-line" aria-hidden="true" />}
      </div>
      <div className="timeline-content">
        <h2 className="section-title">{meta.title}</h2>
        <div className="section-body">{children}</div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
