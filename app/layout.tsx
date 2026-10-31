
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSync | Build Better Teams",
  description:
    "Discover projects, connect with talented students, and build together with SkillSync.",
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/teams", label: "Teams" },
  { href: "/collaboration", label: "Collaboration" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}

        <footer className="site-footer">
          <div
            className="page-shell"
            style={{ paddingTop: 0, paddingBottom: 0 }}
          >
            <div className="brand" style={{ justifyContent: "center" }}>
              <span className="brand-mark">S</span>
              <span>SkillSync</span>
            </div>

            <p>
              Find your people. Share your skills. Build something great.
            </p>

            <small>
              SkillSync · Student Project Collaboration Platform
            </small>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 18,
                marginTop: 18,
              }}
            >
              {navigation.slice(1).map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

