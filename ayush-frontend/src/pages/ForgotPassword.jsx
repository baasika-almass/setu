import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function isValid(value) {
    const trimmed = value.trim();
    const looksLikeAbdm = /^[A-Za-z]{2,5}-?\d{3,}/.test(trimmed);
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    return trimmed.length > 3 && (looksLikeAbdm || looksLikeEmail || trimmed.includes("@abha"));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Enter your Doctor ID, ABDM number, or registered email.");
      return;
    }
    if (!isValid(identifier)) {
      setError("That doesn't look like a valid Doctor ID, ABDM number, or email.");
      return;
    }

    setSubmitting(true);
    // Placeholder for the real ABDM password-reset dispatch call.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 700);
  }

  return (
    <div className="forgot-page">
      <main className="forgot-main">
        {!sent ? (
          <form className="forgot-card" onSubmit={handleSubmit} noValidate>
            <Link to="/signin" className="back-link">
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to sign in
            </Link>

            <h1 className="forgot-title">Reset your password</h1>
            <p className="forgot-subtitle">
              Enter the Doctor ID, ABDM number, or registered email tied to your account, and
              we'll send reset instructions through the National Health Authority gateway.
            </p>

            <div className="field-group">
              <label className="field-label" htmlFor="identifier">
                Doctor ID / ABDM Number / Email
              </label>
              <input
                id="identifier"
                className="field-input"
                type="text"
                placeholder="e.g., DOC-9831-ABDM or name@hospital.org"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button className="submit-button" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send Reset Instructions"}
              {!submitting && <ArrowRight size={17} strokeWidth={2.25} />}
            </button>

            <div className="gateway-note">
              <ShieldCheck size={14} strokeWidth={2} />
              Requests are verified against the National Health Authority Gateway
            </div>
          </form>
        ) : (
          <div className="forgot-card forgot-success">
            <span className="success-icon">
              <MailCheck size={22} strokeWidth={2} />
            </span>
            <h1 className="forgot-title">Check your inbox</h1>
            <p className="forgot-subtitle">
              If <strong>{identifier.trim()}</strong> matches a registered account, reset
              instructions have been sent. The link is valid for 15 minutes.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSent(false);
                setIdentifier("");
              }}
            >
              Send to a different ID
            </button>

            <Link to="/signin" className="back-link back-link-center">
              <ArrowLeft size={15} strokeWidth={2.25} />
              Back to sign in
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
