import { useState } from "react";
import { CheckCircle2, ArrowRight, Download, Printer, RotateCcw } from "lucide-react";
import { jsPDF } from "jspdf";
import { addEncounter } from "../../lib/encounterStore.js";
import { API_ENABLED, saveEncounter } from "../../lib/api.js";

export default function ResultsStep({ record, onStartOver }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      if (API_ENABLED) {
        await saveEncounter({
          abhaId: record.abhaId,
          namasteCode: record.mapping.namasteCode,
          icd11Code: record.mapping.icdCode,
          patientName: record.fullName || undefined,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        addEncounter({
          patientId: record.abhaId || "unknown@abha",
          name: record.fullName || "Unknown Patient",
          term: record.diagnosisTerm,
          namaste: record.mapping.namasteCode,
          icd: record.mapping.icdCode,
        });
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadPdf() {
    const doc = new jsPDF();
    const marginX = 18;
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("NAMASTE Connect — Standardized Encounter Report", marginX, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text("AYUSH Interoperability System · Generated for demonstration purposes", marginX, y);
    y += 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, 192, y);
    y += 10;

    const rows = [
      ["Patient Name", record.fullName || "—"],
      ["Age / Gender", `${record.age || "—"} / ${record.gender}`],
      ["ABHA Address", record.abhaId || "—"],
      ["Traditional System", record.system],
      ["Chief Complaints", record.complaints || "—"],
      ["Input AYUSH Term", record.diagnosisTerm],
      ["NAMASTE Code", record.mapping.namasteCode],
      ["WHO ICD-11 TM2 Code", `${record.mapping.icdCode} — ${record.mapping.icdLabel}`],
      ["EHR Compliance", "COMPLIANT (FHIR R4)"],
    ];

    doc.setFontSize(11);
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(`${label}:`, marginX, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const wrapped = doc.splitTextToSize(String(value), 120);
      doc.text(wrapped, marginX + 55, y);
      y += 8 * Math.max(wrapped.length, 1);
    });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Ministry of AYUSH & Ministry of Health and Family Welfare, Government of India.", marginX, 285);

    doc.save(`${(record.fullName || "patient").replace(/\s+/g, "_")}_standardized_report.pdf`);
  }

  return (
    <div className="results-wrap">
      <div className="results-banner">
        <CheckCircle2 size={22} strokeWidth={2} />
        <div>
          <p className="results-banner-title">Standardization &amp; Integration Successful</p>
          <p className="results-banner-body">
            Traditional Medicine Diagnosis mapped, validated with ABDM criteria, and queued for
            AIIMS EMR push.
          </p>
        </div>
      </div>

      <div className="results-card">
        <h3 className="results-card-title">Patient Record Overview</h3>
        <div className="results-grid">
          <ResultField label="Name & Age" value={`${record.fullName || "—"} (${record.age || "—"}${record.gender?.[0] || ""})`} />
          <ResultField label="ABHA Address" value={record.abhaId || "—"} isLink />
          <ResultField label="Health System" value={`${record.system} System Standard`} />
        </div>
      </div>

      <div className="results-card">
        <h3 className="results-card-title">Standardized Terminology Mapping Details</h3>

        <div className="mapping-row">
          <div>
            <p className="mapping-label">Input AYUSH Term</p>
            <p className="mapping-value">{record.diagnosisTerm}</p>
          </div>
          <span className="mapping-tag mapping-tag-blue">NAMASTE CODE: {record.mapping.namasteCode}</span>
        </div>

        <div className="mapping-arrow" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={2} />
        </div>

        <div className="mapping-row mapping-row-target">
          <div>
            <p className="mapping-label">WHO ICD-11 TM2 Translation Target</p>
            <p className="mapping-value">
              {record.mapping.icdCode} — {record.mapping.icdLabel}
            </p>
          </div>
          <span className="mapping-tag mapping-tag-green">WHO MATCH</span>
        </div>

        <div className="results-meta-row">
          <span>
            EHR COMPLIANCE STATUS: <strong className="meta-compliant">COMPLIANT (FHIR R4)</strong>
          </span>
          <span>API LATENCY: 240ms</span>
        </div>

        <div className="results-actions">
          <button className="submit-button" type="button" onClick={handleSave} disabled={saving || saved}>
            {saved ? "Saved to EMR" : saving ? "Saving…" : "Save to EMR Record"}
            {!saved && !saving && <ArrowRight size={16} strokeWidth={2.25} />}
          </button>
          <button className="secondary-button" type="button" onClick={handleDownloadPdf}>
            <Download size={15} strokeWidth={2} />
            Download PDF Report
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            <Printer size={15} strokeWidth={2} />
            Print Receipt
          </button>
        </div>

        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        {saved && (
          <p className="save-confirmation" role="status">
            Record synced to the hospital EMR. A copy is queued for the ABDM Health Records
            registry.
          </p>
        )}
      </div>

      <button type="button" className="start-over-link" onClick={onStartOver}>
        <RotateCcw size={14} strokeWidth={2.25} />
        Start a new intake
      </button>
    </div>
  );
}

function ResultField({ label, value, isLink }) {
  return (
    <div className="result-field">
      <p className="result-field-label">{label}</p>
      <p className={"result-field-value" + (isLink ? " result-field-link" : "")}>{value}</p>
    </div>
  );
}
