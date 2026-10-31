
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  try {
    // Only authenticated admins can accept applications.
    const auth = await requireRole("admin");

    if (auth.response) {
      return auth.response;
    }

    const body = await req.json();
    const applicationId = Number(body.application_id);

    if (!Number.isInteger(applicationId) || applicationId < 1) {
      return NextResponse.json(
        { error: "A valid application_id is required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE application
       SET status = 'accepted'
       WHERE application_id = $1
         AND status = 'pending'
       RETURNING application_id, student_id, project_id, status`,
      [applicationId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Application not found or is not pending." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Application acceptance failed:", error);

    return NextResponse.json(
      { error: "Unable to accept application." },
      { status: 500 }
    );
  }
}

