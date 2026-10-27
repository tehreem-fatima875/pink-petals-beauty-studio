"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus("");
    setSent(false);
    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = await response.json() as { error?: string; delivered?: boolean };
      if (!response.ok || !result.delivered) throw new Error(result.error || "Your message could not be delivered.");
      setStatus("Your note has been delivered. We look forward to getting back to you.");
      setSent(true);
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Your message could not be delivered.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>Your name<input name="name" minLength={2} maxLength={80} autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" maxLength={254} autoComplete="email" required /></label>
      </div>
      <label>Your message<textarea name="message" minLength={10} maxLength={2000} rows={6} required /></label>
      <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send your note"} <span aria-hidden="true">↗</span></button>
      <p className={`form-status${sent ? " success" : ""}`} role="status" aria-live="polite">{status}</p>
    </form>
  );
}
