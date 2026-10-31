
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireRole } from "@/lib/auth-guard";

export async function GET() {
  try {
    // Only administrators can access database diagnostics.
    const { response } = await requireRole("admin");

    if (response) {
      return response;
    }

    const client = await clientPromise;
    const db = client.db("skillsync_nosql");

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully!",
    });
  } catch (error) {
    console.error("MongoDB diagnostic error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed.",
      },
      { status: 500 }
    );
  }
}

