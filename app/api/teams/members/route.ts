
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role === "student" && user.student_id === null) {
      return NextResponse.json(
        { error: "Your account is not linked to a student record." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const teamId = Number(body.team_id);
    const studentId = Number(body.student_id);

    if (
      !Number.isInteger(teamId) ||
      teamId < 1 ||
      !Number.isInteger(studentId) ||
      studentId < 1
    ) {
      return NextResponse.json(
        { error: "Provide valid team_id and student_id values." },
        { status: 400 }
      );
    }

    // Only an admin or the leader of this team can add members.
    const permission = await pool.query(
      `SELECT
         t.project_id,
         EXISTS (
           SELECT 1
           FROM team_member leader
           WHERE leader.team_id = t.team_id
             AND leader.student_id = $2
             AND LOWER(leader.role) = 'leader'
         ) AS is_leader
       FROM team t
       WHERE t.team_id = $1`,
      [teamId, user.student_id]
    );

    if (permission.rowCount === 0) {
      return NextResponse.json(
        { error: "Team not found." },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "admin";
    const isLeader = permission.rows[0].is_leader;

    if (!isAdmin && !isLeader) {
      return NextResponse.json(
        { error: "Only the team leader or an admin can add members." },
        { status: 403 }
      );
    }

    // The new member must have an accepted application
    // for the project associated with this team.
    const result = await pool.query(
      `INSERT INTO team_member (team_id, student_id, role)
       SELECT t.team_id, s.student_id, 'member'
       FROM team t
       JOIN student s ON s.student_id = $2
       WHERE t.team_id = $1
         AND EXISTS (
           SELECT 1
           FROM application a
           WHERE a.student_id = s.student_id
             AND a.project_id = t.project_id
             AND a.status = 'accepted'
         )
       RETURNING team_id, student_id, role`,
      [teamId, studentId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          error:
            "Student not found or does not have an accepted application for this project.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "This student is already in the team." },
        { status: 409 }
      );
    }

    console.error("Adding team member failed:", error);

    return NextResponse.json(
      { error: "Unable to add team member." },
      { status: 500 }
    );
  }
}

