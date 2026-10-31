
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          window.location.replace("/dashboard");
          return;
        }
      } catch {
        // Allow login if session lookup fails.
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      window.location.replace("/dashboard");
    } catch {
      setError("Unable to connect to SkillSync. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="page-shell" style={{ textAlign: "center", padding: 100 }}>
        Checking your session...
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section
        style={{
          maxWidth: 460,
          margin: "65px auto",
          padding: 36,
          borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span className="brand-mark">S</span>
          <h1 style={{ fontSize: 32, marginTop: 18 }}>
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p style={{ color: "#a1a1aa" }}>
            Sign in to continue building with SkillSync.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.edu"
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              marginBottom: 20,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#15151f",
              color: "white",
            }}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              marginBottom: 20,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#15151f",
              color: "white",
            }}
          />

          {error && (
            <p style={{ color: "#f87171", marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#a1a1aa" }}>
          New to SkillSync?{" "}
          <Link href="/register" className="gradient-text">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

