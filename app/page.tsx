
import Link from "next/link";

const features = [
  {
    icon: "✦",
    title: "Discover Projects",
    description:
      "Explore exciting ideas, find projects that match your interests, and turn your skills into real work.",
    tag: "PROJECT DISCOVERY",
  },
  {
    icon: "⌘",
    title: "Find Your People",
    description:
      "Connect with students who bring different strengths, perspectives, and technical skills to the table.",
    tag: "TEAM BUILDING",
  },
  {
    icon: "◈",
    title: "Build Together",
    description:
      "Keep applications, team information, and project collaboration updates organized in one workspace.",
    tag: "COLLABORATION",
  },
];

const steps = [
  {
    number: "01",
    title: "Explore",
    description: "Browse projects and discover opportunities that interest you.",
  },
  {
    number: "02",
    title: "Connect",
    description: "Apply to projects and bring the right people together.",
  },
  {
    number: "03",
    title: "Create",
    description: "Collaborate with your team and turn ideas into something real.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="page-shell" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="hero-content animate-in">
            <div
              className="badge badge-accent"
              style={{
                display: "inline-flex",
                padding: "8px 14px",
                marginBottom: 8,
              }}
            >
              <span aria-hidden="true">✦</span>
              THE STUDENT COLLABORATION WORKSPACE
            </div>

            <h1 className="hero-title">
              Great things happen
              <br />
              when skills <span className="gradient-text">connect.</span>
            </h1>

            <p className="hero-description">
              Your next big idea deserves the right team. Discover projects,
              connect with talented students, and build something meaningful
              together with SkillSync.
            </p>

            <div className="hero-actions">
              <Link href="/projects" className="btn btn-primary">
                Explore projects <span aria-hidden="true">↗</span>
              </Link>

              <Link href="/dashboard" className="btn btn-secondary">
                Open dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 22,
                marginTop: 28,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              <span>✓ Discover student projects</span>
              <span>✓ Find teammates</span>
              <span>✓ Track collaboration</span>
            </div>
          </div>

          <div
            className="card animate-in"
            style={{
              maxWidth: 920,
              margin: "74px auto 0",
              padding: 0,
              overflow: "hidden",
              borderColor: "#343047",
              boxShadow: "0 25px 100px rgba(91, 73, 196, 0.12)",
              animationDelay: "100ms",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                background: "#131620",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#fb7185" }}>●</span>
                <span style={{ color: "#f4f5fb", fontWeight: 600 }}>
                  Your next collaboration starts here
                </span>
              </div>

              <span className="badge badge-success">Workspace preview</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 0,
              }}
            >
              {[
                {
                  icon: "⌕",
                  title: "Find opportunities",
                  subtitle: "Explore student projects",
                },
                {
                  icon: "◎",
                  title: "Match your skills",
                  subtitle: "Discover where you fit",
                },
                {
                  icon: "↗",
                  title: "Make progress",
                  subtitle: "Keep your team connected",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    padding: "28px 24px",
                    borderRight:
                      index < 2 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div className="project-icon" style={{ marginBottom: 18 }}>
                    {item.icon}
                  </div>

                  <h3 style={{ marginBottom: 7 }}>{item.title}</h3>

                  <p
                    style={{
                      margin: 0,
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell" style={{ paddingTop: 24 }}>
        <div className="section-heading">
          <div>
            <div className="page-eyebrow">Everything in one place</div>
            <h2 style={{ marginTop: 10, marginBottom: 8 }}>
              More than just finding a team.
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              From the first idea to your next milestone.
            </p>
          </div>
        </div>

        <div className="content-grid">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="card card-hover"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div className="project-icon">{feature.icon}</div>

              <div>
                <div className="page-eyebrow" style={{ fontSize: 10 }}>
                  {feature.tag}
                </div>

                <h3 style={{ marginTop: 10, marginBottom: 10 }}>
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.8,
                    marginBottom: 0,
                  }}
                >
                  {feature.description}
                </p>
              </div>

              <div style={{ marginTop: "auto" }}>
                <Link href="/projects">
                  Explore more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-heading">
          <div>
            <div className="page-eyebrow">Simple by design</div>
            <h2 style={{ marginTop: 10, marginBottom: 8 }}>
              From idea to impact.
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Three steps to start building together.
            </p>
          </div>
        </div>

        <div className="content-grid">
          {steps.map((step) => (
            <article key={step.number} className="feature-card card-hover">
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "var(--accent)",
                  fontSize: 34,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                {step.number}
              </div>

              <h3>{step.title}</h3>

              <p
                style={{
                  color: "var(--muted)",
                  lineHeight: 1.8,
                  marginBottom: 0,
                }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div
          className="card"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "clamp(28px, 6vw, 64px)",
            textAlign: "center",
            borderColor: "#494064",
            background:
              "radial-gradient(ellipse at 50% 120%, rgba(139,124,255,.19), transparent 65%), linear-gradient(145deg, #171827, #11141c)",
          }}
        >
          <div className="page-eyebrow">Your next chapter starts here</div>

          <h2
            style={{
              fontSize: "clamp(2rem, 5vw, 3.3rem)",
              margin: "18px 0",
            }}
          >
            Got a skill? <span className="gradient-text">Put it to work.</span>
          </h2>

          <p
            className="muted"
            style={{ maxWidth: 550, margin: "0 auto 26px", lineHeight: 1.8 }}
          >
            Find a project that excites you, meet people who inspire you, and
            start building something worth sharing.
          </p>

          <div className="hero-actions" style={{ marginTop: 0 }}>
            <Link href="/projects" className="btn btn-primary">
              Find your next project ↗
            </Link>

            <Link href="/dashboard" className="btn btn-secondary">
              Visit your workspace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

