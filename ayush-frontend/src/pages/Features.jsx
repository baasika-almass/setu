import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Radio, Search, Download, FileSpreadsheet, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { getEncounters } from "../lib/encounterStore.js";
import { getLogs } from "../lib/apiLogStore.js";
import { buildStats } from "../lib/dashboardData.js";
import { API_ENABLED, fetchEncounters, fetchLogs, fetchStats } from "../lib/api.js";
import DashboardOverview from "./DashboardOverview.jsx";
import "./Features.css";
import "./Dashboard.css";

const TABS = {
  undefined: "Dashboard",
  patients: "Patients",
  "api-logs": "API Logs",
  settings: "Settings",
  reports: "Reports",
};

const TITLES = {
  Dashboard: "National Health Interoperability Console",
  Patients: "Patients",
  "API Logs": "API Logs",
  Settings: "Settings",
  Reports: "Reports",
};

const SUBTITLES = {
  Dashboard: "Live ABDM sandbox reporting and terminology mappings",
  Patients: "Every patient record standardized through the EMR Sandbox",
  "API Logs": "Recent calls made to the terminology and FHIR endpoints",
  Settings: "Manage your account and notification preferences",
  Reports: "Generate and download reports from your sandbox activity",
};

export default function Features() {
  const { tab } = useParams();
  const activeItem = TABS[tab];
  const [encounters, setEncounters] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!API_ENABLED) {
      setEncounters(getEncounters());
      setLogs(getLogs());
      return undefined;
    }
    let cancelled = false;
    Promise.all([fetchEncounters(), fetchLogs(), fetchStats()])
      .then(([e, l, st]) => {
        if (cancelled) return;
        setEncounters(e);
        setLogs(l);
        setStats(st);
        setLoadError("");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) navigate("/signin");
        else setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [activeItem, navigate]);

  if (!activeItem) return <Navigate to="/dashboard" replace />;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1 className="dash-title">{TITLES[activeItem]}</h1>
          <p className="dash-subtitle">{SUBTITLES[activeItem]}</p>
        </div>
        <span className="live-badge">
          <Radio size={13} strokeWidth={2.5} />
          Live Translator Connected
        </span>
      </div>

      {loadError && <p className="form-error" role="alert">{loadError}</p>}

      {activeItem === "Dashboard" && (
        <DashboardOverview encounters={encounters} stats={stats} sampleCharts={API_ENABLED} />
      )}
      {activeItem === "Patients" && <PatientsTab encounters={encounters} />}
      {activeItem === "API Logs" && <ApiLogsTab logs={logs} />}
      {activeItem === "Settings" && <SettingsTab />}
      {activeItem === "Reports" && <ReportsTab encounters={encounters} stats={stats} />}
    </div>
  );
}

function PatientsTab({ encounters }) {
  const [query, setQuery] = useState("");

  const filtered = encounters.filter((row) => {
    const haystack = `${row.name} ${row.patientId} ${row.term}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="table-card">
      <div className="table-card-head">
        <h2 className="chart-title">All Patients ({encounters.length})</h2>
        <div className="search-box">
          <Search size={15} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name, ABHA ID, or term…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="table-scroll">
        <table className="encounters-table">
          <thead>
            <tr>
              <th>ABHA ID</th>
              <th>Name</th>
              <th>Traditional Term</th>
              <th>NAMASTE Code</th>
              <th>ICD-11 Code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((row) => (
                <tr key={row.patientId}>
                  <td className="table-link">{row.patientId}</td>
                  <td>{row.name}</td>
                  <td>{row.term}</td>
                  <td>{row.namaste}</td>
                  <td>{row.icd}</td>
                  <td>
                    <span className="status-pill">SYNCED</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-row">
                  {query ? `No patients match "${query}".` : "No patients yet. Run the EMR Sandbox to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiLogsTab({ logs }) {
  return (
    <div className="table-card">
      <h2 className="chart-title">Recent API Calls</h2>
      <div className="table-scroll">
        <table className="encounters-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={`${log.endpoint}-${log.time}-${i}`}>
                <td>{log.time}</td>
                <td>
                  <span className={"method-chip method-chip-" + log.method.toLowerCase()}>{log.method}</span>
                </td>
                <td className="table-mono">{log.endpoint}</td>
                <td>
                  <span className={"status-pill" + (log.status >= 400 ? " status-pill-error" : "")}>
                    {log.status}
                  </span>
                </td>
                <td>{log.latencyMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-footnote">
        Runs through the EMR Sandbox automatically append their pipeline calls here.
      </p>
    </div>
  );
}

function SettingsTab() {
  const [form, setForm] = useState({
    name: "Dr. Ramesh Iyer",
    doctorId: "DOC-9831-ABDM",
    email: "ramesh.iyer@hospital.org",
    emailAlerts: true,
    smsAlerts: false,
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <form className="settings-card" onSubmit={handleSave}>
      <h2 className="chart-title">Account</h2>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label">Full Name</label>
          <input
            className="field-input"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Doctor ID / ABDM Number</label>
          <input className="field-input" type="text" value={form.doctorId} disabled />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Email</label>
        <input
          className="field-input"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      <h2 className="chart-title settings-section-title">Notifications</h2>

      <ToggleRow
        label="Email alerts"
        description="Get notified when a sandbox run fails or a code mapping needs review."
        checked={form.emailAlerts}
        onChange={(value) => update("emailAlerts", value)}
      />
      <ToggleRow
        label="SMS alerts"
        description="Receive a text for urgent EMR sync failures."
        checked={form.smsAlerts}
        onChange={(value) => update("smsAlerts", value)}
      />

      <div className="settings-footer">
        <button className="submit-button" type="submit">
          Save Changes
        </button>
        {saved && <span className="save-tag">Settings saved</span>}
      </div>
    </form>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="toggle-row">
      <div>
        <p className="toggle-label">{label}</p>
        <p className="toggle-description">{description}</p>
      </div>
      <span className={"toggle-switch" + (checked ? " is-on" : "")} onClick={() => onChange(!checked)}>
        <span className="toggle-knob" />
      </span>
    </label>
  );
}

function ReportsTab({ encounters, stats }) {
  function downloadSummaryPdf() {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("NAMASTE Connect — Weekly Summary Report", 18, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, 18, y);
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(18, y, 192, y);
    y += 10;

    doc.setFontSize(11);
    buildStats(stats).forEach((stat) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(`${stat.label}:`, 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(stat.value, 100, y);
      y += 8;
    });

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("Recent Encounters", 18, y);
    y += 8;

    encounters.forEach((row) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`${row.name} (${row.patientId}) — ${row.term} → ${row.icd}`, 18, y);
      y += 7;
    });

    doc.save("namaste-connect-weekly-summary.pdf");
  }

  function downloadEncountersCsv() {
    const header = "Patient ID,Name,Traditional Term,NAMASTE Code,ICD-11 Code\n";
    const rows = encounters
      .map((row) => `${row.patientId},${row.name},${row.term},${row.namaste},${row.icd}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "namaste-connect-encounters.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const REPORTS = [
    {
      title: "Weekly Summary Report",
      description: "Key metrics and recent encounters, formatted as a shareable PDF.",
      action: downloadSummaryPdf,
      icon: Download,
      actionLabel: "Download PDF",
    },
    {
      title: "Encounter Export",
      description: "Every standardized encounter as a spreadsheet-ready CSV file.",
      action: downloadEncountersCsv,
      icon: FileSpreadsheet,
      actionLabel: "Download CSV",
    },
    {
      title: "Print Dashboard Snapshot",
      description: "Open the browser print dialog for the current dashboard view.",
      action: () => window.print(),
      icon: Printer,
      actionLabel: "Print",
    },
  ];

  return (
    <div className="reports-grid">
      {REPORTS.map(({ title, description, action, icon: Icon, actionLabel }) => (
        <div className="report-card" key={title}>
          <span className="report-icon">
            <Icon size={18} strokeWidth={2} />
          </span>
          <h3 className="report-title">{title}</h3>
          <p className="report-description">{description}</p>
          <button className="secondary-button" type="button" onClick={action}>
            {actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
