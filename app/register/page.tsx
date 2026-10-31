
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        // Allow registration if session lookup fails.
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must contain 8–72 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: Number(studentId),
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      window.location.href = "/login?registered=true";
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
          margin: "55px auto",
          padding: 36,
          borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <span className="brand-mark">S</span>
          <h1 style={{ fontSize: 32, marginTop: 18 }}>
            Join <span className="gradient-text">SkillSync</span>
          </h1>
          <p style={{ color: "#a1a1aa" }}>
            Create your student account and start collaborating.
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="number"
            min="1"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="Enter your student ID"
            required
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              marginBottom: 18,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#15151f",
              color: "white",
            }}
          />

          <label htmlFor="email">University email</label>
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
              marginBottom: 18,
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
            placeholder="Minimum 8 characters"
            required
            autoComplete="new-password"
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              marginBottom: 18,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#15151f",
              color: "white",
            }}
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "#a1a1aa" }}>
          Already registered?{" "}
          <Link href="/login" className="gradient-text">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

