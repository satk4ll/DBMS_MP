
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser, requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const projectIdParam = req.nextUrl.searchParams.get("project_id");
    const studentIdParam = req.nextUrl.searchParams.get("student_id");

    const conditions: string[] = [];
    const values: number[] = [];

    // Students can only retrieve their own applications.
    if (user.role === "student") {
      if (user.student_id === null) {
        return NextResponse.json(
          { error: "Student account is not linked to a student record." },
          { status: 403 }
        );
      }

      if (
        studentIdParam !== null &&
        Number(studentIdParam) !== user.student_id
      ) {
        return NextResponse.json(
          { error: "You can only view your own applications." },
          { status: 403 }
        );
      }

      values.push(user.student_id);
      conditions.push(`a.student_id = $${values.length}`);
    }

    // Admins may filter applications by student.
    if (user.role === "admin" && studentIdParam !== null) {
      const studentId = Number(studentIdParam);

      if (!Number.isInteger(studentId) || studentId < 1) {
        return NextResponse.json(
          { error: "Valid student_id is required." },
          { status: 400 }
        );
      }

      values.push(studentId);
      conditions.push(`a.student_id = $${values.length}`);
    }

    if (projectIdParam !== null) {
      const projectId = Number(projectIdParam);

      if (!Number.isInteger(projectId) || projectId < 1) {
        return NextResponse.json(
          { error: "Valid project_id is required." },
          { status: 400 }
        );
      }

      values.push(projectId);
      conditions.push(`a.project_id = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT
         a.application_id,
         a.student_id,
         s.name AS student_name,
         a.project_id,
         p.title AS project_title,
         a.status,
         a.applied_at
       FROM application a
       JOIN student s ON s.student_id = a.student_id
       JOIN project p ON p.project_id = a.project_id
       ${whereClause}
       ORDER BY a.applied_at DESC, a.application_id DESC`,
      values
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Application retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve applications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only authenticated students can apply.
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

    const body = await req.json();
    const projectId = Number(body.project_id);

    if (!Number.isInteger(projectId) || projectId < 1) {
      return NextResponse.json(
        { error: "A valid project_id is required." },
        { status: 400 }
      );
    }

    // The student ID comes from the verified session,
    // never from the request body.
    const result = await pool.query(
      `INSERT INTO application (student_id, project_id)
       SELECT $1, p.project_id
       FROM project p
       WHERE p.project_id = $2
         AND p.status = 'open'
       RETURNING application_id, student_id, project_id, status, applied_at`,
      [studentId, projectId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Project not found or is not open." },
        { status: 404 }
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
        { error: "You have already applied to this project." },
        { status: 409 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return NextResponse.json(
        { error: "The specified project does not exist." },
        { status: 400 }
      );
    }

    console.error("Application creation failed:", error);

    return NextResponse.json(
      { error: "Unable to submit application." },
      { status: 500 }
    );
  }
}

