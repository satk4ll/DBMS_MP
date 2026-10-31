
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  user_id: number;
  student_id: number | null;
  email: string;
  role: "student" | "admin";
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/teams", label: "Teams" },
  { href: "/collaboration", label: "Collaboration" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        window.location.href = "/login";
      }
    } catch {
      alert("Unable to log out. Please try again.");
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>
            Skill<span className="gradient-text">Sync</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {!loading && user ? (
            <>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {user.email}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#a78bfa",
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="nav-link"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link href="/login" className="nav-link">
                  Login
                </Link>
                <Link href="/register" className="nav-link">
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}

