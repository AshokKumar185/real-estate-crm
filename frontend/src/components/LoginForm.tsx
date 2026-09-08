"use client";

import { FormEvent, useState } from "react";
import { login } from "../lib/api";
import type { User } from "../lib/types";

export function LoginForm({
  onLogin,
}: {
  onLogin: (token: string, user: User) => void;
}) {
  const [email, setEmail] = useState("admin@estateflow.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email, password);
      localStorage.setItem("estateflow-token", result.token);
      localStorage.setItem("estateflow-user", JSON.stringify(result.user));
      onLogin(result.token, result.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-art">
        <p className="eyebrow">ESTATEFLOW CRM</p>
        <h1>Move every conversation closer to home.</h1>
        <p>A calm command center for modern property sales teams.</p>
        {/* <div className="art-stat">
          <strong>07</strong>
          <span>stages from first contact to booked</span>
        </div> */}
      </div>
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand-mark">EF</div>
        <p className="eyebrow">WELCOME BACK</p>
        <h2>Sign in to your workspace</h2>
        <p className="muted">Your pipeline is waiting.</p>
        <label>
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? (
            "Signing in..."
          ) : (
            <>
              Enter workspace <span>→</span>
            </>
          )}
        </button>
        <p className="demo-hint">Demo: admin@estateflow.local / Password123!</p>
      </form>
    </main>
  );
}
