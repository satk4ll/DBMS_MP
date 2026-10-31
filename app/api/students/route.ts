
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    // Verify the user's session.
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // Retrieve student profiles and their associated skills.
    const result = await pool.query(`
      SELECT
        s.student_id,
        s.name,
        s.department,
        s.year,
        s.experience_level,
        COALESCE(
          json_agg(
            json_build_object(
              'skill', k.skill_name,
              'proficiency', ss.proficiency,
              'years_experience', ss.years_experience
            )
          ) FILTER (WHERE k.skill_id IS NOT NULL),
          '[]'
        ) AS skills
      FROM student s
      LEFT JOIN student_skill ss
        ON ss.student_id = s.student_id
      LEFT JOIN skill k
        ON k.skill_id = ss.skill_id
      GROUP BY s.student_id
      ORDER BY s.name;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Students API error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve student information." },
      { status: 500 }
    );
  }
}

