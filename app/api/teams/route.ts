
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-guard";

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
        t.team_id,
        t.project_id,
        p.title AS project_title,
        t.created_at,
        tm.student_id,
        s.name AS student_name,
        tm.role
      FROM team t
      JOIN project p ON p.project_id = t.project_id
      LEFT JOIN team_member tm ON tm.team_id = t.team_id
      LEFT JOIN student s ON s.student_id = tm.student_id
      ORDER BY t.team_id, tm.student_id
    `);

    const teams = new Map<
      number,
      {
        team_id: number;
        project_id: number;
        project_title: string;
        created_at: string;
        members: {
          student_id: number;
          student_name: string;
          role: string;
        }[];
      }
    >();

    for (const row of result.rows) {
      if (!teams.has(row.team_id)) {
        teams.set(row.team_id, {
          team_id: row.team_id,
          project_id: row.project_id,
          project_title: row.project_title,
          created_at: row.created_at,
          members: [],
        });
      }

      if (row.student_id !== null) {
        teams.get(row.team_id)!.members.push({
          student_id: row.student_id,
          student_name: row.student_name,
          role: row.role,
        });
      }
    }

    return NextResponse.json(Array.from(teams.values()));
  } catch (error) {
    console.error("Team retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve teams." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRole("student");

  if (auth.response) {
    return auth.response;
  }

  const studentId = auth.user!.student_id;

  if (studentId === null) {
    return NextResponse.json(
      { error: "Your account is not linked to a student record." },
      { status: 403 }
    );
  }

  let client;

  try {
    const body = await req.json();
    const projectId = Number(body.project_id);

    if (!Number.isInteger(projectId) || projectId < 1) {
      return NextResponse.json(
        { error: "A valid project_id is required." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    await client.query("BEGIN");

    const accepted = await client.query(
      `SELECT 1
       FROM application
       WHERE student_id = $1
         AND project_id = $2
         AND status = 'accepted'`,
      [studentId, projectId]
    );

    if (accepted.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "An accepted application is required to create a team." },
        { status: 403 }
      );
    }

    const team = await client.query(
      `INSERT INTO team (project_id)
       VALUES ($1)
       RETURNING team_id, project_id, created_at`,
      [projectId]
    );

    await client.query(
      `INSERT INTO team_member (team_id, student_id, role)
       VALUES ($1, $2, 'leader')`,
      [team.rows[0].team_id, studentId]
    );

    await client.query("COMMIT");

    return NextResponse.json(
      { ...team.rows[0], leader_id: studentId },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Team creation rollback failed:", rollbackError);
      }
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "A team already exists for this project." },
        { status: 409 }
      );
    }

    console.error("Team creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create team." },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

