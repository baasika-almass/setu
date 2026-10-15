import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { API_ENABLED, login } from "../lib/api.js";
import "./SignIn.css";

export default function SignIn() {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!doctorId.trim() || !password.trim()) {
      setError("Enter both your Doctor ID / ABDM number and password to continue.");
      return;
    }

    setSubmitting(true);
    if (!API_ENABLED) {
      // Demo mode: no backend configured.
      setTimeout(() => {
        setSubmitting(false);
        navigate("/dashboard");
      }, 600);
      return;
    }
    try {
      await login(doctorId.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signin-page">
      <main className="signin-main">
        <p className="signin-intro">
          Mapping AYUSH clinical terminology to WHO ICD-11 TM2 codes, synced directly to your
          hospital's EMR.
        </p>

        <form className="signin-card" onSubmit={handleSubmit} noValidate>
          <h1 className="signin-title">Sign In</h1>
          <p className="signin-subtitle">Access the clinical terminology pipeline</p>

          <div className="field-group">
            <label className="field-label" htmlFor="doctorId">
              Doctor ID / ABDM Number
            </label>
            <input
              id="doctorId"
              className="field-input"
              type="text"
              placeholder="e.g., DOC-9831-ABDM"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <Link className="forgot-link" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="password-wrap">
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Lock className="password-icon" size={17} strokeWidth={1.75} />
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={submitting}>
            {submitting ? "Authenticating…" : "Authenticate & Launch Console"}
            {!submitting && <ArrowRight size={17} strokeWidth={2.25} />}
          </button>

          <div className="gateway-note">
            <ShieldCheck size={14} strokeWidth={2} />
            Authenticating against National Health Authority Gateway
          </div>
        </form>

        <ul className="trust-row" aria-label="Compliance">
          <li>ABDM Verified</li>
          <li>FHIR R4</li>
          <li>ISO 27001</li>
        </ul>
      </main>
    </div>
  );
}
