
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { createSession, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Safely parse the request body.
    let body: Record<string, unknown>;

    try {
      const parsed = await request.json();

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          { error: "Invalid login request." },
          { status: 400 }
        );
      }

      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const passwordBytes = new TextEncoder().encode(password).length;

    // Validate credentials.
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length === 0 ||
      passwordBytes > 72
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    // Find the account.
    const result = await pool.query(
      `
      SELECT
        user_id,
        student_id,
        email,
        password_hash,
        role
      FROM user_account
      WHERE email = $1
      `,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify the submitted password.
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create a signed session.
    const sessionToken = createSession({
      user_id: Number(user.user_id),
      student_id:
        user.student_id === null
          ? null
          : Number(user.student_id),
      email: user.email,
      role: user.role,
    });

    // Store the session in a secure HTTP-only cookie.
    const cookieStore = await cookies();

    cookieStore.set(
      "skillsync_session",
      sessionToken,
      sessionCookieOptions
    );

    return NextResponse.json({
      message: "Login successful.",
      user: {
        user_id: Number(user.user_id),
        student_id:
          user.student_id === null
            ? null
            : Number(user.student_id),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Unable to log in." },
      { status: 500 }
    );
  }
}

