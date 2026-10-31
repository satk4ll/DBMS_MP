
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth-guard";

const allowedStatuses = [
  "open",
  "in_progress",
  "completed",
  "closed",
];

export async function GET(req: NextRequest) {
  try {
    // Require a valid logged-in session.
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // Read and validate query parameters.
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const status = (
      req.nextUrl.searchParams.get("status") ?? ""
    ).trim();

    if (q.length > 100) {
      return NextResponse.json(
        { error: "Search query must not exceed 100 characters." },
        { status: 400 }
      );
    }

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid project status filter." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        p.project_id,
        p.title,
        p.description,
        p.status,
        p.created_at,
        s.name AS owner_name,
        COALESCE(
          array_agg(k.skill_name)
          FILTER (WHERE k.skill_id IS NOT NULL),
          '{}'
        ) AS required_skills
      FROM project p
      JOIN student s
        ON s.student_id = p.owner_id
      LEFT JOIN project_skill ps
        ON ps.project_id = p.project_id
      LEFT JOIN skill k
        ON k.skill_id = ps.skill_id
      WHERE
        ($1 = '' OR
          p.title ILIKE '%' || $1 || '%' OR
          p.description ILIKE '%' || $1 || '%')
        AND
        ($2 = '' OR p.status = $2)
      GROUP BY p.project_id, s.name
      ORDER BY p.created_at DESC
      `,
      [q, status]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Projects API error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve projects." },
      { status: 500 }
    );
  }
}

