
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    // Verify authentication.
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const projectId = Number(
      req.nextUrl.searchParams.get("project_id")
    );

    const requestedStudentId = Number(
      req.nextUrl.searchParams.get("student_id")
    );

    // Validate project ID.
    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return NextResponse.json(
        { error: "Provide a valid project_id." },
        { status: 400 }
      );
    }

    let studentId: number;

    // Students can only view their own skill matches.
    if (user.role === "student") {
      if (!user.student_id) {
        return NextResponse.json(
          { error: "Student account is not linked to a student profile." },
          { status: 403 }
        );
      }

      studentId = user.student_id;
    } else if (user.role === "admin") {
      // Admins may inspect a selected student's matches.
      if (
        !Number.isInteger(requestedStudentId) ||
        requestedStudentId <= 0
      ) {
        return NextResponse.json(
          { error: "Admins must provide a valid student_id." },
          { status: 400 }
        );
      }

      studentId = requestedStudentId;
    } else {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    // Calculate the percentage of required project skills
    // present in the student's profile.
    const result = await pool.query(
      `
      WITH required AS (
        SELECT skill_id, required_level
        FROM project_skill
        WHERE project_id = $2
      ),
      matched AS (
        SELECT
          r.skill_id,
          r.required_level,
          ss.proficiency,
          ss.years_experience
        FROM required r
        LEFT JOIN student_skill ss
          ON ss.skill_id = r.skill_id
          AND ss.student_id = $1
      )
      SELECT
        COUNT(*)::int AS required_count,
        COUNT(proficiency)::int AS matched_count,
        COALESCE(
          ROUND(
            100.0 * COUNT(proficiency) /
            NULLIF(COUNT(*), 0),
            2
          ),
          0
        ) AS match_score,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', skill_id,
              'required_level', required_level,
              'student_proficiency', proficiency,
              'years_experience', years_experience
            )
          ),
          '[]'
        ) AS details
      FROM matched
      `,
      [studentId, projectId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Matches API error:", error);

    return NextResponse.json(
      { error: "Unable to calculate skill matches." },
      { status: 500 }
    );
  }
}

