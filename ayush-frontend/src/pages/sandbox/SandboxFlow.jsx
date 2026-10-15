import { useState } from "react";
import IntakeStep from "./IntakeStep.jsx";
import ProcessingStep from "./ProcessingStep.jsx";
import ResultsStep from "./ResultsStep.jsx";
import { DIAGNOSIS_TERMS_BY_SYSTEM } from "./diagnosisData.js";
import "./Sandbox.css";

export default function SandboxFlow() {
  const [step, setStep] = useState("intake");
  const [record, setRecord] = useState(null);

  function handleIntakeSubmit(formData) {
    const mapping = DIAGNOSIS_TERMS_BY_SYSTEM[formData.system].find(
      (entry) => entry.term === formData.diagnosisTerm
    );
    setRecord({ ...formData, mapping });
    setStep("processing");
  }

  function handleProcessingComplete() {
    setStep("results");
  }

  function handleStartOver() {
    setRecord(null);
    setStep("intake");
  }

  return (
    <div className="sandbox-page">
      <SandboxStepHeader step={step} />

      {step === "intake" && <IntakeStep onSubmit={handleIntakeSubmit} />}
      {step === "processing" && record && (
        <ProcessingStep record={record} onComplete={handleProcessingComplete} />
      )}
      {step === "results" && record && (
        <ResultsStep record={record} onStartOver={handleStartOver} />
      )}
    </div>
  );
}

function SandboxStepHeader({ step }) {
  const steps = [
    { key: "intake", label: "Patient Intake" },
    { key: "processing", label: "Standardization" },
    { key: "results", label: "EMR Sync" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="sandbox-heading">
      <h1 className="sandbox-title">EMR Sandbox</h1>
      <p className="sandbox-subtitle">
        Simulate a full clinical intake against the AIIMS Sandbox Gateway and WHO ICD-11 index.
      </p>
      <p className="sandbox-note">
        Sample dataset: 50 common conditions per AYUSH system, with demonstration codes.
      </p>
      <ol className="sandbox-steps" aria-label="Sandbox progress">
        {steps.map((s, index) => {
          const state = index < activeIndex ? "done" : index === activeIndex ? "active" : "upcoming";
          return (
            <li key={s.key} className={`sandbox-step sandbox-step-${state}`}>
              <span className="sandbox-step-dot">{index + 1}</span>
              <span className="sandbox-step-label">{s.label}</span>
              {index < steps.length - 1 && <span className="sandbox-step-connector" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
