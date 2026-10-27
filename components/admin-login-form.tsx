"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
      redirectTo: "/admin",
    });
    if (result?.error) {
      setError("Sign-in failed. Check your credentials and try again.");
      setLoading(false);
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <label>Email address<input type="email" name="email" autoComplete="username" required /></label>
      <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
      {error && <p className="form-status" role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
