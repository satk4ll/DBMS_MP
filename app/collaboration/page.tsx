
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProjectNote = {
  _id: string;
  project_id: number;
  note: string;
  author: string;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleString()
    : "Date unavailable";
}

export default function CollaborationPage() {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [projectId, setProjectId] = useState("3");
  const [author, setAuthor] = useState("");
  const [noteText, setNoteText] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotes = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/notes", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load collaboration notes.");
      }

      const data = await response.json();

      setNotes(Array.isArray(data) ? data : data.notes ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load collaboration notes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const visibleNotes = useMemo(() => {
    if (filter === "all") return notes;

    return notes.filter(
      (note) => String(note.project_id) === filter
    );
  }, [notes, filter]);

  const projectOptions = useMemo(
    () =>
      Array.from(new Set(notes.map((note) => note.project_id))).sort(
        (a, b) => a - b
      ),
    [notes]
  );

  async function publishNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: Number(projectId),
          author: author.trim(),
          note: noteText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not publish the update.");
      }

      setNoteText("");
      setMessage("Your update was saved to MongoDB.");
      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not publish the update."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header animate-in">
        <div>
          <div className="page-eyebrow">THE TEAM ACTIVITY SPACE</div>

          <h1 style={{ margin: "10px 0" }}>
            Build in <span className="gradient-text">sync.</span>
          </h1>

          <p className="muted" style={{ maxWidth: 600 }}>
            Share progress, capture decisions, and keep every project update
            in one place. Your collaboration notes are stored in MongoDB.
          </p>
        </div>

        <Link href="/dashboard" className="btn btn-secondary">
          ← Dashboard
        </Link>
      </section>

      {message && (
        <div className="notice notice-success" style={{ marginBottom: 20 }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="notice notice-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <section className="stats-grid" style={{ marginBottom: 32 }}>
        <article className="card stat-card">
          <div className="project-icon">◈</div>
          <div className="stat-value">{notes.length}</div>
          <div className="stat-label">Total updates</div>
        </article>

        <article className="card stat-card">
          <div className="project-icon">◎</div>
          <div className="stat-value">{projectOptions.length}</div>
          <div className="stat-label">Projects with updates</div>
        </article>

        <article className="card stat-card">
          <div className="project-icon">♙</div>
          <div className="stat-value">
            {new Set(notes.map((note) => note.author)).size}
          </div>
          <div className="stat-label">Contributors</div>
        </article>
      </section>

      <section
        className="two-column-grid section"
        style={{ alignItems: "start" }}
      >
        <div className="card">
          <div className="page-eyebrow">SHARE YOUR PROGRESS</div>

          <h2 style={{ margin: "10px 0" }}>Publish an update</h2>

          <p className="muted" style={{ fontSize: 14 }}>
            Let your team know what you have accomplished, what you learned,
            or what needs attention.
          </p>

          <form
            onSubmit={publishNote}
            className="form-stack"
            style={{ marginTop: 22 }}
          >
            <div>
              <label htmlFor="collab-project">Project ID</label>

              <input
                id="collab-project"
                type="number"
                min="1"
                required
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="e.g. 3"
              />
            </div>

            <div>
              <label htmlFor="collab-author">Your name</label>

              <input
                id="collab-author"
                required
                maxLength={100}
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="collab-note">What's the update?</label>

              <textarea
                id="collab-note"
                rows={6}
                required
                maxLength={2000}
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Share progress, decisions, milestones, or blockers..."
              />

              <div
                className="muted"
                style={{
                  fontSize: 12,
                  textAlign: "right",
                  marginTop: 5,
                }}
              >
                {noteText.length}/2000 characters
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish update ↗"}
            </button>
          </form>

          <div className="divider" />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="project-icon">◈</div>
            <div>
              <strong>Powered by MongoDB</strong>
              <div className="muted" style={{ fontSize: 12 }}>
                Flexible document-based collaboration storage
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="section-heading">
            <div>
              <div className="page-eyebrow">PROJECT ACTIVITY</div>
              <h2 style={{ margin: "8px 0" }}>Latest updates</h2>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setLoading(true);
                loadNotes();
              }}
            >
              ↻ Refresh
            </button>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="collab-filter">Filter by project</label>

            <select
              id="collab-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All projects</option>

              {projectOptions.map((id) => (
                <option key={id} value={String(id)}>
                  Project #{id}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading updates...</div>
          ) : visibleNotes.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 34 }}>◈</div>
              <h3>No updates found</h3>
              <p>Publish an update or choose another project filter.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {visibleNotes.map((note, index) => (
                <article
                  key={note._id}
                  className="feed-item animate-in"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="feed-meta">
                    <span className="badge badge-accent">
                      Project #{note.project_id}
                    </span>

                    <span>{formatDate(note.created_at)}</span>
                  </div>

                  <p
                    style={{
                      color: "#e5e7f2",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.8,
                    }}
                  >
                    {note.note}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                        color: "#c5bcff",
                        fontWeight: 700,
                      }}
                    >
                      {note.author?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600 }}>{note.author}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Project contributor
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

