
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("skillsync_nosql");

    const notes = await db
      .collection("project_notes")
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching notes:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const projectId = Number(body.project_id);
    const note = String(body.note ?? "").trim();

    if (
      !Number.isInteger(projectId) ||
      projectId < 1 ||
      !note ||
      note.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide a valid project_id and note (max 2000 characters).",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("skillsync_nosql");

    const result = await db.collection("project_notes").insertOne({
      project_id: projectId,
      note,
      author: user.email,
      created_at: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project note saved successfully",
        note_id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving note:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save note" },
      { status: 500 }
    );
  }
}

