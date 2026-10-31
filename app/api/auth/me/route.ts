
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

