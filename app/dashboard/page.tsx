"use client";



import { useCallback, useEffect, useState } from "react";

import Link from "next/link";



type Application = {

  application_id: number;

  student_id: number;

  student_name: string;

  project_id: number;

  project_title: string;

  status: string;

  applied_at: string;

};



type TeamMember = {

  student_id: number;

  student_name: string;

  role: string;

};



type Team = {

  team_id: number;

  project_id: number;

  project_title: string;

  created_at: string;

  members: TeamMember[];

};



type ProjectNote = {

  _id: string;

  project_id: number;

  note: string;

  author: string;

  created_at: string;

};



type DashboardData = Record<string, unknown>;



function statusClass(status = "") {

  switch (status.toLowerCase()) {

    case "accepted":

    case "completed":

      return "badge-success";

    case "pending":

      return "badge-warning";

    case "rejected":

    case "closed":

      return "badge-danger";

    case "in_progress":

    case "in progress":

      return "badge-accent";

    default:

      return "badge";

  }

}



function formatDate(value?: string) {

  if (!value) return "Date unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime())

    ? value

    : date.toLocaleString();

}



function getCount(

  data: DashboardData,

  candidates: string[],

  fallback: number

) {

  for (const key of candidates) {

    const value = data[key];

    if (

      typeof value === "number" ||

      (typeof value === "string" && value.trim() !== "")

    ) {

      const parsed = Number(value);

      if (Number.isFinite(parsed)) return parsed;

    }

  }

  return fallback;

}



export default function DashboardPage() {

  const [dashboard, setDashboard] = useState<DashboardData>({});

  const [applications, setApplications] = useState<Application[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [notes, setNotes] = useState<ProjectNote[]>([]);



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [acceptingId, setAcceptingId] = useState<number | null>(null);



  const [projectId, setProjectId] = useState("3");

  const [author, setAuthor] = useState("");

  const [noteText, setNoteText] = useState("");



  const [message, setMessage] = useState("");

  const [error, setError] = useState("");



  const loadData = useCallback(async () => {

    try {

      setError("");



      const responses = await Promise.all([

        fetch("/api/dashboard", { cache: "no-store" }),

        fetch("/api/applications", { cache: "no-store" }),

        fetch("/api/teams", { cache: "no-store" }),

        fetch("/api/notes", { cache: "no-store" }),

      ]);



      if (responses.some((response) => !response.ok)) {

        throw new Error("One or more dashboard APIs failed to load.");

      }



      const [

        dashboardData,

        applicationsData,

        teamsData,

        notesData,

      ] = await Promise.all(responses.map((response) => response.json()));



      setDashboard(dashboardData);



      setApplications(

        Array.isArray(applicationsData)

          ? applicationsData

          : applicationsData.applications ?? []

      );



      setTeams(

        Array.isArray(teamsData)

          ? teamsData

          : teamsData.teams ?? []

      );



      setNotes(

        Array.isArray(notesData)

          ? notesData

          : notesData.notes ?? []

      );

    } catch (err) {

      console.error(err);

      setError("Couldn't load all dashboard information. Please refresh.");

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    loadData();

  }, [loadData]);



  async function acceptApplication(applicationId: number) {

    try {

      setAcceptingId(applicationId);

      setMessage("");

      setError("");



      const response = await fetch("/api/applications/accept", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ application_id: applicationId }),

      });



      const data = await response.json();



      if (!response.ok || data.success === false || data.error) {

        throw new Error(data.message ?? data.error ?? "Acceptance failed.");

      }



      setMessage(`Application #${applicationId} accepted successfully.`);

      await loadData();

    } catch (err) {

      setError(

        err instanceof Error ? err.message : "Could not accept application."

      );

    } finally {

      setAcceptingId(null);

    }

  }



  async function addNote(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();



    try {

      setSaving(true);

      setMessage("");

      setError("");



      const response = await fetch("/api/notes", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          project_id: Number(projectId),

          author: author.trim(),

          note: noteText.trim(),

        }),

      });



      const data = await response.json();



      if (!response.ok || !data.success) {

        throw new Error(data.message ?? "Could not save collaboration note.");

      }



      setNoteText("");

      setMessage("Collaboration note saved to MongoDB.");

      await loadData();

    } catch (err) {

      setError(

        err instanceof Error ? err.message : "Could not save collaboration note."

      );

    } finally {

      setSaving(false);

    }

  }



  const studentCount = getCount(

    dashboard,

    ["total_students", "student_count", "students"],

    4

  );



  const projectCount = getCount(

    dashboard,

    ["total_projects", "project_count", "projects"],

    3

  );



  const applicationCount = applications.length;

  const isAdmin = dashboard.role === "admin";



  const teamCount = teams.length;



  const openProjectCount = getCount(

    dashboard,

    ["open_projects", "open_project_count"],

    0

  );



  const stats = [

    { label: "Students", value: studentCount, icon: "♙", color: "#8b7cff" },

    { label: "Projects", value: projectCount, icon: "◈", color: "#60a5fa" },

    { label: "Applications", value: applicationCount, icon: "↗", color: "#fbbf64" },

    { label: "Teams", value: teamCount, icon: "◎", color: "#4adea2" },

    { label: "Open projects", value: openProjectCount, icon: "✦", color: "#e879f9" },

  ];



  return (

    <main className="page-shell">

      <section className="page-header animate-in">

        <div>

          <div className="page-eyebrow">YOUR WORKSPACE</div>

          <h1 style={{ margin: "10px 0" }}>

            Welcome to your <span className="gradient-text">dashboard.</span>

          </h1>

          <p className="muted" style={{ margin: 0 }}>

            Your projects, applications, teams, and collaboration — all in one place.

          </p>

        </div>



        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

          <Link href="/projects" className="btn btn-primary">

            Explore projects ↗

          </Link>

          <button

            className="btn btn-secondary"

            onClick={() => {

              setLoading(true);

              loadData();

            }}

          >

            ↻ Refresh

          </button>

        </div>

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



      {loading ? (

        <div className="empty-state">Loading your workspace...</div>

      ) : (

        <>

          <section>

            <div className="section-heading">

              <div>

                <div className="page-eyebrow">AT A GLANCE</div>

                <h2 style={{ margin: "8px 0 0" }}>Workspace overview</h2>

              </div>

              <span className="badge badge-success">Live data</span>

            </div>



            <div className="stats-grid">

              {stats.map((stat, index) => (

                <article

                  key={stat.label}

                  className="card stat-card animate-in"

                  style={{ animationDelay: `${index * 45}ms` }}

                >

                  <div

                    style={{

                      width: 42,

                      height: 42,

                      display: "grid",

                      placeItems: "center",

                      borderRadius: 12,

                      color: stat.color,

                      background: `${stat.color}18`,

                      border: `1px solid ${stat.color}35`,

                      fontSize: 21,

                    }}

                  >

                    {stat.icon}

                  </div>



                  <div className="stat-value">{stat.value}</div>

                  <div className="stat-label">{stat.label}</div>

                </article>

              ))}

            </div>

          </section>



          <section className="section" id="applications">

            <div className="section-heading">

              <div>

                <div className="page-eyebrow">APPLICATION MANAGEMENT</div>

                <h2 style={{ margin: "8px 0 0" }}>Project applications</h2>

              </div>

              <span className="badge badge-accent">

                {applications.length} total

              </span>

            </div>



            {applications.length === 0 ? (

              <div className="empty-state">

                <div style={{ fontSize: 32 }}>↗</div>

                <h3>No applications yet</h3>

                <p>Explore projects and submit your first application.</p>

                <Link href="/projects" className="btn btn-primary">

                  Browse projects

                </Link>

              </div>

            ) : (

              <div className="two-column-grid">

                {applications.map((application) => (

                  <article

                    className="card card-hover"

                    key={application.application_id}

                  >

                    <div

                      style={{

                        display: "flex",

                        justifyContent: "space-between",

                        gap: 12,

                        alignItems: "flex-start",

                      }}

                    >

                      <div className="project-icon">↗</div>

                      <span className={`badge ${statusClass(application.status)}`}>

                        {application.status}

                      </span>

                    </div>



                    <div>

                      <div className="page-eyebrow" style={{ fontSize: 10 }}>

                        APPLICATION #{application.application_id}

                      </div>

                      <h3 style={{ fontSize: 19, margin: "8px 0" }}>

                        {application.project_title}

                      </h3>

                      <p style={{ margin: "6px 0" }}>

                        Applicant: <strong>{application.student_name}</strong>

                      </p>

                      <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>

                        Submitted {formatDate(application.applied_at)}

                      </p>

                    </div>



                    <div className="divider" />



                    {isAdmin && application.status.toLowerCase() === "pending" ? (

                      <button

                        className="btn btn-success"

                        disabled={acceptingId === application.application_id}

                        onClick={() =>

                          acceptApplication(application.application_id)

                        }

                      >

                        {acceptingId === application.application_id

                          ? "Accepting..."

                          : "✓ Accept application"}

                      </button>

                    ) : (

                      <div className="muted" style={{ fontSize: 13 }}>

                        {isAdmin ? "Application status" : "Your application status"}: {application.status}

                      </div>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>



          <section className="section" id="teams">

            <div className="section-heading">

              <div>

                <div className="page-eyebrow">PEOPLE WHO BUILD TOGETHER</div>

                <h2 style={{ margin: "8px 0 0" }}>Your teams</h2>

              </div>

              <span className="badge badge-accent">{teams.length} teams</span>

            </div>



            {teams.length === 0 ? (

              <div className="empty-state">

                <div style={{ fontSize: 32 }}>◎</div>

                <h3>No teams created yet</h3>

                <p>Accepted project applications can help form your teams.</p>

              </div>

            ) : (

              <div className="content-grid">

                {teams.map((team, index) => (

                  <article

                    className="card card-hover animate-in"

                    key={team.team_id}

                    style={{ animationDelay: `${index * 50}ms` }}

                  >

                    <div className="project-icon">◎</div>

                    <div className="page-eyebrow" style={{ fontSize: 10 }}>

                      TEAM #{team.team_id}

                    </div>



                    <h3 style={{ margin: "6px 0" }}>{team.project_title}</h3>

                    <p className="muted" style={{ fontSize: 12 }}>

                      Project #{team.project_id} · Created{" "}

                      {formatDate(team.created_at)}

                    </p>



                    <div className="divider" />



                    <div className="section-heading" style={{ marginBottom: 12 }}>

                      <strong>Team members</strong>

                      <span className="badge">{team.members?.length ?? 0}</span>

                    </div>



                    {team.members?.length ? (

                      <div style={{ display: "grid", gap: 12 }}>

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

                                width: 36,

                                height: 36,

                                display: "grid",

                                placeItems: "center",

                                flexShrink: 0,

                                borderRadius: "50%",

                                background: "var(--accent-soft)",

                                color: "#c5bcff",

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

                      <p className="muted">No members assigned yet.</p>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>



          <section className="section" id="collaboration">

            <div className="section-heading">

              <div>

                <div className="page-eyebrow">MONGODB · DOCUMENT STORAGE</div>

                <h2 style={{ margin: "8px 0 0" }}>Collaboration feed</h2>

                <p className="muted" style={{ marginBottom: 0 }}>

                  Project updates and team notes in one shared feed.

                </p>

              </div>

              <span className="badge badge-success">

                ◉ MongoDB connected

              </span>

            </div>



            <div className="two-column-grid">

              <div className="card">

                <div className="project-icon" style={{ marginBottom: 18 }}>

                  ✎

                </div>

                <h3 style={{ marginTop: 0 }}>Share a project update</h3>

                <p className="muted" style={{ fontSize: 13 }}>

                  Add a progress note for your team. Notes are stored as

                  documents in MongoDB.

                </p>



                <form onSubmit={addNote} className="form-stack">

                  <div>

                    <label htmlFor="note-project">Project ID</label>

                    <input

                      id="note-project"

                      type="number"

                      min="1"

                      required

                      value={projectId}

                      onChange={(event) => setProjectId(event.target.value)}

                      placeholder="e.g. 3"

                    />

                  </div>



                  <div>

                    <label htmlFor="note-author">Author</label>

                    <input

                      id="note-author"

                      required

                      maxLength={100}

                      value={author}

                      onChange={(event) => setAuthor(event.target.value)}

                      placeholder="Your name"

                    />

                  </div>



                  <div>

                    <label htmlFor="note-text">Update</label>

                    <textarea

                      id="note-text"

                      rows={4}

                      required

                      maxLength={2000}

                      value={noteText}

                      onChange={(event) => setNoteText(event.target.value)}

                      placeholder="What has your team accomplished?"

                    />

                  </div>



                  <button

                    className="btn btn-primary"

                    type="submit"

                    disabled={saving}

                  >

                    {saving ? "Saving update..." : "Publish update ↗"}

                  </button>

                </form>

              </div>



              <div>

                <div className="section-heading">

                  <h3 style={{ margin: 0 }}>Recent updates</h3>

                  <span className="badge">{notes.length} notes</span>

                </div>



                {notes.length === 0 ? (

                  <div className="empty-state">

                    No updates yet. Publish the first one.

                  </div>

                ) : (

                  <div style={{ display: "grid", gap: 12 }}>

                    {notes.map((note) => (

                      <article className="feed-item" key={note._id}>

                        <div className="feed-meta">

                          <span className="badge badge-accent">

                            Project #{note.project_id}

                          </span>

                          <span>{formatDate(note.created_at)}</span>

                        </div>



                        <p

                          style={{

                            color: "#e0e3ef",

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

                            gap: 9,

                            color: "var(--muted)",

                            fontSize: 13,

                          }}

                        >

                          <span

                            style={{

                              width: 27,

                              height: 27,

                              display: "grid",

                              placeItems: "center",

                              borderRadius: "50%",

                              background: "var(--accent-soft)",

                              color: "#c5bcff",

                              fontWeight: 700,

                            }}

                          >

                            {note.author?.charAt(0)?.toUpperCase() ?? "?"}

                          </span>

                          {note.author}

                        </div>

                      </article>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </section>



          <section className="section">

            <div className="card">

              <div className="page-eyebrow">UNDER THE HOOD</div>

              <h2 style={{ margin: "10px 0 18px" }}>Dual-database architecture</h2>



              <div className="two-column-grid">

                <div className="feature-card">

                  <div className="project-icon">▤</div>

                  <h3>PostgreSQL</h3>

                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>

                    Relational records for students, skills, projects,

                    applications, teams, and memberships.

                  </p>

                  <span className="badge badge-success">Relational database</span>

                </div>



                <div className="feature-card">

                  <div className="project-icon">◈</div>

                  <h3>MongoDB</h3>

                  <p className="muted" style={{ fontSize: 13, lineHeight: 1.8 }}>

                    Flexible document storage for project collaboration

                    notes and updates.

                  </p>

                  <span className="badge badge-accent">Document database</span>

                </div>

              </div>

            </div>

          </section>

        </>

      )}

    </main>

  );

}

