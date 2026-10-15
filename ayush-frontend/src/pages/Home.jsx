import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, FlaskConical, BookOpen, ShieldCheck } from "lucide-react";
import { DIAGNOSIS_TERMS_BY_SYSTEM } from "./sandbox/diagnosisData.js";
import "./Home.css";

const SYSTEMS = Object.keys(DIAGNOSIS_TERMS_BY_SYSTEM);

const STEPS = [
  {
    title: "Pick the traditional term",
    body: "The clinician selects the AYUSH system and the diagnosis exactly as they would write it in a traditional record.",
  },
  {
    title: "Resolve both codes",
    body: "Setu looks up the NAMASTE code and its matching WHO ICD-11 TM2 code in one request.",
  },
  {
    title: "Sync a FHIR R4 encounter",
    body: "The coded diagnosis is packaged as a standard encounter and pushed to the hospital's EMR.",
  },
];

const GAPS = [
  "Some common AYUSH conditions have no TM2 equivalent today.",
  "Setu flags these instead of forcing a wrong match, so the gap stays visible to clinicians and to the people maintaining the classification.",
];

export default function Home() {
  const [system, setSystem] = useState(SYSTEMS[0]);
  const [termIndex, setTermIndex] = useState(0);

  const terms = DIAGNOSIS_TERMS_BY_SYSTEM[system];
  const entry = terms[termIndex] ?? terms[0];

  function changeSystem(next) {
    setSystem(next);
    setTermIndex(0);
  }

  const payload = `{
  "namasteCode": "${entry.namasteCode}",
  "icd11Code": "${entry.icdCode}"
}`;

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1 className="home-title">
            Write the diagnosis in AYUSH terms. Report it in ICD-11.
          </h1>
          <p className="home-lead">
            Setu connects NAMASTE terminology with WHO ICD-11 TM2 codes, so a vaidya's
            diagnosis reaches the hospital EMR in the standard form insurers, registries and
            other doctors can read.
          </p>
          <div className="home-actions">
            <Link to="/sandbox" className="home-btn home-btn-primary">
              Try the EMR sandbox
              <ArrowRight size={17} strokeWidth={2.25} />
            </Link>
            <Link to="/signin" className="home-btn home-btn-quiet">
              Sign in
            </Link>
          </div>
          <a href="#how-it-works" className="home-scroll-hint">
            <ArrowDown size={15} strokeWidth={2} />
            See how a term becomes a code
          </a>
        </div>

        <div className="home-mapper" aria-label="Live code lookup">
          <div className="home-mapper-controls">
            <div className="home-control">
              <label htmlFor="home-system">AYUSH system</label>
              <select
                id="home-system"
                value={system}
                onChange={(e) => changeSystem(e.target.value)}
              >
                {SYSTEMS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="home-control">
              <label htmlFor="home-term">Diagnosis term</label>
              <select
                id="home-term"
                value={termIndex}
                onChange={(e) => setTermIndex(Number(e.target.value))}
              >
                {terms.map((t, i) => (
                  <option key={t.namasteCode} value={i}>
                    {t.term}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="home-mapper-result" aria-live="polite">
            <div className="home-code-block">
              <span className="home-code-name">NAMASTE</span>
              <span className="home-code-value">{entry.namasteCode}</span>
            </div>
            <ArrowRight className="home-code-arrow" size={20} strokeWidth={2} aria-hidden="true" />
            <div className="home-code-block home-code-block-target">
              <span className="home-code-name">ICD-11 TM2</span>
              <span className="home-code-value">{entry.icdCode}</span>
            </div>
          </div>
          <p className="home-code-label">{entry.icdLabel}</p>
          <pre className="home-payload">{payload}</pre>
        </div>
      </section>

      <section className="home-section" id="how-it-works">
        <div className="home-section-inner">
          <h2 className="home-h2">From clinic note to EMR in three steps</h2>
          <ol className="home-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="home-step">
                <span className="home-step-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section home-section-tint">
        <div className="home-section-inner">
          <h2 className="home-h2">Five AYUSH systems, one pipeline</h2>
          <ul className="home-systems">
            {SYSTEMS.map((s) => (
              <li key={s}>
                <strong>{s}</strong>
                <span>{DIAGNOSIS_TERMS_BY_SYSTEM[s][0].term}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-inner home-split">
          <div>
            <h2 className="home-h2">Where TM2 stops, Setu says so</h2>
            {GAPS.map((g) => (
              <p key={g} className="home-body">
                {g}
              </p>
            ))}
          </div>
          <ul className="home-tiles">
            <li>
              <FlaskConical size={20} strokeWidth={1.75} />
              <div>
                <strong>EMR Sandbox</strong>
                <span>Run a full intake and watch each code resolve.</span>
                <Link to="/sandbox">Open sandbox</Link>
              </div>
            </li>
            <li>
              <BookOpen size={20} strokeWidth={1.75} />
              <div>
                <strong>API reference</strong>
                <span>Four endpoints cover sign-in, lookup and sync.</span>
                <Link to="/api-docs">Read the docs</Link>
              </div>
            </li>
            <li>
              <ShieldCheck size={20} strokeWidth={1.75} />
              <div>
                <strong>Clinician console</strong>
                <span>Dashboard, patients and API logs in one place.</span>
                <Link to="/dashboard">Open dashboard</Link>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-section-inner home-cta-inner">
          <h2>Want Setu in your hospital's EMR?</h2>
          <Link to="/contact" className="home-btn home-btn-primary">
            Contact the team
          </Link>
        </div>
      </section>
    </div>
  );
}
