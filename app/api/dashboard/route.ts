
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM student)::int AS total_students,
        (SELECT COUNT(*) FROM project)::int AS total_projects,
        (SELECT COUNT(*) FROM project WHERE status = 'open')::int AS open_projects,
        (SELECT COUNT(*) FROM application)::int AS total_applications,
        (SELECT COUNT(*) FROM team)::int AS total_teams
    `);

    let personalApplications = null;

    if (user.role === "student" && user.student_id !== null) {
      const personalResult = await pool.query(
        `SELECT COUNT(*)::int AS personal_applications
         FROM application
         WHERE student_id = $1`,
        [user.student_id]
      );

      personalApplications =
        personalResult.rows[0].personal_applications;
    }

    return NextResponse.json({
      ...result.rows[0],
      role: user.role,
      personal_applications: personalApplications,
    });
  } catch (error) {
    console.error("Dashboard statistics query failed:", error);

    return NextResponse.json(
      { error: "Unable to load dashboard statistics." },
      { status: 500 }
    );
  }
}

