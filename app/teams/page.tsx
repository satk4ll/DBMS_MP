
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Member = {
  student_id: number;
  student_name: string;
  role: string;
};

type Team = {
  team_id: number;
  project_id: number;
  project_title: string;
  created_at: string;
  members: Member[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString()
    : "Date unavailable";
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/teams", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Could not load teams.");
      }

      const data = await response.json();

      setTeams(
        Array.isArray(data) ? data : data.teams ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load teams."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const memberCount = teams.reduce(
    (total, team) => total + (team.members?.length ?? 0),
    0
  );

  return (
    <main className="page-shell">
      <section className="page-header animate-in">
        <div>
          <div className="page-eyebrow">PEOPLE WHO BUILD TOGETHER</div>
          <h1 style={{ margin: "10px 0" }}>
            Your <span className="gradient-text">teams.</span>
          </h1>
          <p className="muted" style={{ maxWidth: 580 }}>
            Meet the people behind your projects. Explore team members,
            responsibilities, and project assignments in one place.
          </p>
        </div>

        <Link href="/dashboard" className="btn btn-secondary">
          ← Dashboard
        </Link>
      </section>

      <section className="stats-grid" style={{ marginBottom: 32 }}>
        <article className="card stat-card">
          <div className="project-icon">◎</div>
          <div className="stat-value">{teams.length}</div>
          <div className="stat-label">Teams</div>
        </article>

        <article className="card stat-card">
          <div className="project-icon">♙</div>
          <div className="stat-value">{memberCount}</div>
          <div className="stat-label">Team memberships</div>
        </article>

        <article className="card stat-card">
          <div className="project-icon">◈</div>
          <div className="stat-value">
            {new Set(teams.map((team) => team.project_id)).size}
          </div>
          <div className="stat-label">Projects represented</div>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <div className="page-eyebrow">YOUR COLLABORATORS</div>
            <h2 style={{ margin: "8px 0" }}>Team directory</h2>
          </div>
          <button className="btn btn-secondary" onClick={loadTeams}>
            ↻ Refresh
          </button>
        </div>

        {error && <div className="notice notice-error">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>◎</div>
            <h3>No teams yet</h3>
            <p>Teams will appear here when they're created in SkillSync.</p>
            <Link href="/projects" className="btn btn-primary">
              Explore projects
            </Link>
          </div>
        ) : (
          <div className="content-grid">
            {teams.map((team, index) => (
              <article
                key={team.team_id}
                className="card card-hover animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div className="project-icon">◎</div>
                  <span className="badge badge-accent">
                    Team #{team.team_id}
                  </span>
                </div>

                <div>
                  <div className="page-eyebrow" style={{ fontSize: 10 }}>
                    PROJECT #{team.project_id}
                  </div>
                  <h3 style={{ fontSize: 20, margin: "8px 0" }}>
                    {team.project_title}
                  </h3>
                  <p className="muted" style={{ fontSize: 12 }}>
                    Created {formatDate(team.created_at)}
                  </p>
                </div>

                <div className="divider" />

                <div className="section-heading" style={{ marginBottom: 12 }}>
                  <strong>Team members</strong>
                  <span className="badge">
                    {team.members?.length ?? 0}
                  </span>
                </div>

                {team.members?.length ? (
                  <div style={{ display: "grid", gap: 14 }}>
                    {team.members.map((member) => (
                      <div
                        key={member.student_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 11,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            color: "#c5bcff",
                            background: "var(--accent-soft)",
                            border: "1px solid var(--border)",
                            fontWeight: 700,
                          }}
                        >
                          {member.student_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>
                            {member.student_name}
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            Student #{member.student_id}
                          </div>
                        </div>

                        <span className="badge badge-accent">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No members assigned to this team.
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div
          className="card"
          style={{
            background:
              "radial-gradient(ellipse at right, rgba(139,124,255,.13), transparent 65%), var(--surface)",
          }}
        >
          <div className="page-eyebrow">KEEP BUILDING</div>
          <h2 style={{ margin: "12px 0" }}>
            Great projects need great teams.
          </h2>
          <p className="muted">
            Explore opportunities and find your next collaboration.
          </p>
          <Link href="/projects" className="btn btn-primary">
            Discover projects ↗
          </Link>
        </div>
      </section>
    </main>
  );
}

