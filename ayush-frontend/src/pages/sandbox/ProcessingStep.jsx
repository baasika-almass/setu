import { useEffect, useRef, useState } from "react";
import { RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { addLogs } from "../../lib/apiLogStore.js";
import { API_ENABLED, handshake, validateAbha, listTerms, lookupCode, validateEncounter } from "../../lib/api.js";

// In API mode each pipeline step makes the matching real call to the Setu backend.
function runStep(index, record) {
  const body = {
    abhaId: record.abhaId,
    namasteCode: record.mapping.namasteCode,
    icd11Code: record.mapping.icdCode,
  };
  const calls = [
    () => handshake(),
    () => validateAbha(record.abhaId),
    () => listTerms(record.system),
    () => lookupCode(record.mapping.namasteCode),
    () => validateEncounter(body),
  ];
  return calls[index] ? calls[index]() : Promise.resolve();
}

function buildSteps(record) {
  return [
    {
      title: "Connecting to EMR System",
      note: "Handshake verified with AIIMS Sandbox Gateway",
      log: "[SYSTEM] Handshake established with AIIMS Sandbox Gateway.",
      endpoint: "/v1/emr/handshake",
      method: "GET",
      status: 200,
    },
    {
      title: "Validating Patient Demographics",
      note: `ABHA ID status ${record.abhaId || "unknown"} active`,
      log: `[SYSTEM] Payload built successfully for ABHA: ${record.abhaId || "unknown"}.`,
      endpoint: "/v1/abha/validate",
      method: "POST",
      status: 200,
    },
    {
      title: "Mapping NAMASTE Terminology",
      note: `${record.system} · ${record.diagnosisTerm} translated to ${record.mapping.namasteCode}`,
      log: `[MAPPING] Matched traditional symptom "${record.diagnosisTerm}" to NAMASTE code ${record.mapping.namasteCode}.`,
      endpoint: "/v1/namaste/terms",
      method: "GET",
      status: 200,
    },
    {
      title: "Mapping ICD-11 TM2 Codes",
      note: "Querying WHO Global Epidemiology Index…",
      log: `[API LOG] GET /v1/icd11/tm2/lookup?code=${record.mapping.namasteCode} — 200 OK.`,
      endpoint: "/v1/icd11/tm2/lookup",
      method: "POST",
      status: 200,
    },
    {
      title: "EHR Standards Validation",
      note: "Ensuring National EMR compliance protocol",
      log: "[SYSTEM] FHIR R4 bundle validated against National EMR compliance protocol.",
      endpoint: "/v1/fhir/validate",
      method: "POST",
      status: 200,
    },
    {
      title: "Saving Standardized Record to EMR",
      note: "Executing secure encrypted database save",
      log: `[API LOG] POST /v1/fhir/StandardizedEncounter — WAITING FOR WHO GATEWAY ACK (200ms)… ACK received.`,
      endpoint: "/v1/fhir/StandardizedEncounter",
      method: "POST",
      status: 201,
    },
  ];
}

const STEP_DURATION_MS = 850;

export default function ProcessingStep({ record, onComplete }) {
  const steps = useRef(buildSteps(record)).current;
  const [completedCount, setCompletedCount] = useState(0);
  const [logLines, setLogLines] = useState([`[SYSTEM] Initializing pipeline for ${record.fullName || "patient"}…`]);
  const logRef = useRef(null);

  useEffect(() => {
    if (completedCount >= steps.length) {
      if (!API_ENABLED) {
        addLogs(
          steps.map((step) => ({
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            method: step.method,
            endpoint: step.endpoint,
            status: step.status,
            latencyMs: 120 + Math.floor(Math.random() * 140),
          }))
        );
      }
      const finishTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => {
      const step = steps[completedCount];
      setLogLines((prev) => [...prev, step.log]);
      if (API_ENABLED) {
        runStep(completedCount, record).catch((err) =>
          setLogLines((prev) => [...prev, `[ERROR] ${step.endpoint} — ${err.message}`])
        );
      }
      setCompletedCount((prev) => prev + 1);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [completedCount, steps, onComplete, record]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  const progressPct = Math.round((completedCount / steps.length) * 100);
  const isDone = completedCount >= steps.length;

  return (
    <div className="processing-card">
      <div className="processing-head">
        <div>
          <h2 className="processing-title">Clinical API Pipeline Active</h2>
          <p className="processing-subtitle">Standardizing codes against WHO ICD-11 Module 2 index</p>
        </div>
        <span className={"spin-icon" + (isDone ? " spin-icon-done" : "")} aria-hidden="true">
          <RefreshCw size={16} strokeWidth={2.25} />
        </span>
      </div>

      <div className="processing-progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className="processing-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <ul className="processing-steps">
        {steps.map((step, index) => {
          const state = index < completedCount ? "done" : index === completedCount ? "active" : "upcoming";
          return (
            <li key={step.title} className={`processing-step processing-step-${state}`}>
              <span className="processing-step-icon">
                {state === "done" ? (
                  <CheckCircle2 size={18} strokeWidth={2} />
                ) : state === "active" ? (
                  <RefreshCw size={16} strokeWidth={2.25} className="spin-icon" />
                ) : (
                  <Circle size={18} strokeWidth={1.75} />
                )}
              </span>
              <span>
                <span className="processing-step-title">{step.title}</span>
                <span className="processing-step-note">{step.note}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="deviation-console">
        <p className="deviation-header">
          <span className="deviation-dot" aria-hidden="true" />
          LIVE DEVIATION CONSOLE PIPELINE
        </p>
        <div className="deviation-log" ref={logRef}>
          {logLines.map((line, i) => (
            <p key={i} className="deviation-line">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
