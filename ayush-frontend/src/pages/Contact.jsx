import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Fill in your name, email, and message before sending.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 600);
  }

  return (
    <div className="contact-page">
      <div className="contact-intro">
        <h1 className="contact-title">Get in touch</h1>
        <p className="contact-subtitle">
          Questions about integrating NAMASTE Connect with your hospital's EMR, ABDM
          onboarding, or the API? Send a note and the platform team will follow up.
        </p>
      </div>

      {!sent ? (
        <form className="contact-card" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="field-input"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@hospital.org"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              className="field-input field-textarea"
              rows={5}
              placeholder="Tell us what you're trying to do…"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="submit-button" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send Message"}
            {!sending && <ArrowRight size={16} strokeWidth={2.25} />}
          </button>
        </form>
      ) : (
        <div className="contact-card contact-success">
          <span className="success-icon">
            <CheckCircle2 size={22} strokeWidth={2} />
          </span>
          <h2 className="contact-success-title">Message sent</h2>
          <p className="contact-success-body">
            Thanks, {form.name.split(" ")[0]}. The team will reply to {form.email} shortly.
          </p>
        </div>
      )}

      <p className="contact-direct">
        <Mail size={14} strokeWidth={2} />
        Prefer email? Reach the team directly at platform@namasteconnect.gov.in
      </p>
    </div>
  );
}
