
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Project = {
  project_id: number;
  title: string;
  description?: string;
  status?: string;
  owner_id?: number;
  owner_name?: string;
  created_at?: string;
  required_skills?: (string | { skill_name?: string; name?: string })[];
  skills?: (string | { skill_name?: string; name?: string })[];
  project_skills?: {
    skill_name?: string;
    name?: string;
    required_level?: string;
  }[];
};

const projectIcons = ["◈", "⌘", "✳", "⌬", "✦", "◎"];

function statusClass(status = "") {
  const value = status.toLowerCase();

  if (value === "open" || value === "active") return "badge-success";
  if (value === "in_progress" || value === "in progress")
    return "badge-accent";
  if (value === "completed") return "badge-success";
  if (value === "closed") return "badge-danger";

  return "badge-warning";
}

function getSkills(project: Project): string[] {
  const values = [
    ...(project.required_skills ?? []),
    ...(project.skills ?? []),
    ...(project.project_skills ?? []),
  ];

  return Array.from(
    new Set(
      values
        .map((skill) => {
          if (typeof skill === "string") return skill;

          return (
            skill.skill_name ??
            skill.name ??
            ""
          );
        })
        .filter(Boolean)
    )
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [studentId, setStudentId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load projects.");
      }

      const data = await response.json();

      const rows = Array.isArray(data)
        ? data
        : data.projects ?? data.data ?? [];

      setProjects(rows);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading projects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const allSkills = useMemo(() => {
    return Array.from(
      new Set(projects.flatMap((project) => getSkills(project)))
    ).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        getSkills(project).some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const status = (project.status ?? "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter ||
        status.replace("_", " ") === statusFilter;

      const matchesSkill =
        skillFilter === "all" ||
        getSkills(project).includes(skillFilter);

      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [projects, search, statusFilter, skillFilter]);

  async function applyToProject(project: Project) {
    const id = Number(studentId);

    if (!Number.isInteger(id) || id < 1) {
      setError("Enter a valid student ID.");
      return;
    }

    try {
      setApplyingId(project.project_id);
      setError("");
      setMessage("");

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: id,
          project_id: project.project_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false || data.error) {
        throw new Error(
          data.message ??
            data.error ??
            "Could not submit your application."
        );
      }

      setMessage(`Application submitted for "${project.title}"!`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit your application."
      );
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <main className="page-shell">
      <section
        className="animate-in"
        style={{
          padding: "38px 0 34px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="page-eyebrow">Discover your next opportunity</div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 12,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ margin: "0 0 14px" }}>
              Find your next{" "}
              <span className="gradient-text">big thing.</span>
            </h1>

            <p
              className="muted"
              style={{ maxWidth: 580, lineHeight: 1.8, margin: 0 }}
            >
              Explore student-led projects, discover skills you can learn,
              and find opportunities to build something meaningful together.
            </p>
          </div>

          <Link href="/dashboard" className="btn btn-secondary">
            Your dashboard ↗
          </Link>
        </div>

        <div
          className="stats-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            marginTop: 32,
          }}
        >
          <div className="card stat-card">
            <div className="stat-label">All projects</div>
            <div className="stat-value">{projects.length}</div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Open opportunities</div>
            <div className="stat-value">
              {
                projects.filter((project) =>
                  ["open", "active"].includes(
                    (project.status ?? "").toLowerCase()
                  )
                ).length
              }
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-label">Unique skills</div>
            <div className="stat-value">{allSkills.length}</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <h2 style={{ margin: 0 }}>Explore projects</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              Find the right fit for your skills and interests.
            </p>
          </div>

          <span className="badge badge-accent">
            {filteredProjects.length} results
          </span>
        </div>

        <div
          className="card"
          style={{ marginBottom: 24, padding: 18 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 14,
              alignItems: "end",
            }}
          >
            <div>
              <label htmlFor="project-search">Search projects</label>
              <input
                id="project-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, description, skills..."
              />
            </div>

            <div>
              <label htmlFor="status-filter">Project status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="skill-filter">Required skill</label>
              <select
                id="skill-filter"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
              >
                <option value="all">All skills</option>
                {allSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSkillFilter("all");
              }}
            >
              Reset filters
            </button>
          </div>
        </div>

        {message && (
          <div className="notice notice-success" style={{ marginBottom: 20 }}>
            {message}{" "}
            <Link href="/dashboard">View dashboard →</Link>
          </div>
        )}

        {error && (
          <div className="notice notice-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div
          className="card"
          style={{ marginBottom: 20, padding: 16 }}
        >
          <label htmlFor="student-id">Demo student ID for applications</label>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              id="student-id"
              type="number"
              min="1"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              style={{ maxWidth: 180 }}
            />
            <span className="muted" style={{ fontSize: 13 }}>
              Select a valid student ID from your PostgreSQL student records.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 32, marginBottom: 12 }}>⌕</div>
            <h3>No matching projects</h3>
            <p>Try changing your search or clearing the filters.</p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSkillFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="content-grid">
            {filteredProjects.map((project, index) => {
              const skills = getSkills(project);
              const status = project.status ?? "Unknown";

              return (
                <article
                  key={project.project_id}
                  className="card card-hover project-card animate-in"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div className="project-icon">
                      {projectIcons[index % projectIcons.length]}
                    </div>

                    <span className={`badge ${statusClass(status)}`}>
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <div className="page-eyebrow" style={{ fontSize: 10 }}>
                      PROJECT #{project.project_id}
                    </div>

                    <h3 style={{ fontSize: 20, margin: "9px 0 10px" }}>
                      {project.title}
                    </h3>

                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 14,
                        lineHeight: 1.8,
                        margin: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {project.description || "No description provided yet."}
                    </p>
                  </div>

                  <div>
                    <div className="stat-label" style={{ marginBottom: 10 }}>
                      SKILLS & TECHNOLOGIES
                    </div>

                    <div className="tag-list">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
                          <span className="tag" key={skill}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="muted" style={{ fontSize: 13 }}>
                          No skills listed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divider" style={{ marginTop: "auto" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <span className="muted" style={{ fontSize: 12 }}>
                      {project.created_at
                        ? new Date(project.created_at).toLocaleDateString()
                        : "Student collaboration"}
                    </span>

                    <button
                      className="btn btn-primary"
                      disabled={
                        applyingId === project.project_id ||
                        ["closed", "completed"].includes(
                          status.toLowerCase()
                        )
                      }
                      onClick={() => applyToProject(project)}
                    >
                      {applyingId === project.project_id
                        ? "Applying..."
                        : ["closed", "completed"].includes(
                              status.toLowerCase()
                            )
                          ? "Unavailable"
                          : "Apply now ↗"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

