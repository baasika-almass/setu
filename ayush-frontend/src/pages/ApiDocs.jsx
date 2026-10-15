import { useState } from "react";
import { Copy, Check } from "lucide-react";
import "./ApiDocs.css";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/auth/session",
    summary: "Authenticate a practitioner against the ABDM gateway using a Doctor ID / ABDM number.",
    body: `{
  "doctorId": "DOC-9831-ABDM",
  "password": "••••••••"
}`,
  },
  {
    method: "GET",
    path: "/v1/namaste/terms",
    summary: "List traditional diagnosis terms for a given AYUSH system (Ayurveda, Siddha, Unani, Yoga & Naturopathy, Homeopathy).",
    body: `GET /v1/namaste/terms?system=Ayurveda`,
  },
  {
    method: "POST",
    path: "/v1/icd11/tm2/lookup",
    summary: "Resolve a NAMASTE code to its matching WHO ICD-11 TM2 code.",
    body: `{
  "namasteCode": "A_JV.1.1"
}`,
  },
  {
    method: "POST",
    path: "/v1/fhir/StandardizedEncounter",
    summary: "Push a standardized FHIR R4 encounter bundle to the connected EMR.",
    body: `{
  "abhaId": "ramesh@abha",
  "namasteCode": "A_JV.1.1",
  "icd11Code": "SF82"
}`,
  },
];

export default function ApiDocs() {
  return (
    <div className="docs-page">
      <div className="docs-intro">
        <h1 className="docs-title">API Reference</h1>
        <p className="docs-subtitle">
          Core endpoints for integrating the AYUSH–ICD11 terminology pipeline with your own
          EMR or clinical system. All requests require a valid session token from
          <code> /v1/auth/session</code>.
        </p>
      </div>

      <div className="docs-list">
        {ENDPOINTS.map((endpoint) => (
          <EndpointCard key={endpoint.path + endpoint.method} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}

function EndpointCard({ endpoint }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(endpoint.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="endpoint-card">
      <div className="endpoint-head">
        <span className={"method-tag method-" + endpoint.method.toLowerCase()}>{endpoint.method}</span>
        <code className="endpoint-path">{endpoint.path}</code>
      </div>
      <p className="endpoint-summary">{endpoint.summary}</p>
      <div className="endpoint-code-wrap">
        <button className="copy-button" type="button" onClick={handleCopy}>
          {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <pre className="endpoint-code">{endpoint.body}</pre>
      </div>
    </div>
  );
}
