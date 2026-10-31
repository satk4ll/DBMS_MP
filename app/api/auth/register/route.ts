
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Parse and validate the request body.
    let body: Record<string, unknown>;

    try {
      const parsed = await request.json();

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          { error: "Invalid registration data." },
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

    const studentId = Number(body.student_id);
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // Validate student ID.
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json(
        { error: "A valid student ID is required." },
        { status: 400 }
      );
    }

    // Validate email.
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate password length and bcrypt's 72-byte limit.
    const passwordBytes = new TextEncoder().encode(password).length;

    if (password.length < 8 || passwordBytes > 72) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters and must not exceed 72 bytes.",
        },
        { status: 400 }
      );
    }

    // Verify that the student ID and email match an existing record.
    const student = await pool.query(
      `
      SELECT student_id
      FROM student
      WHERE student_id = $1
        AND LOWER(email) = $2
      `,
      [studentId, email]
    );

    if (student.rowCount === 0) {
      return NextResponse.json(
        { error: "Student details could not be verified." },
        { status: 400 }
      );
    }

    // Hash the password before storing it.
    const passwordHash = await bcrypt.hash(password, 12);

    // The role is always student.
    // Unique constraints prevent duplicate accounts.
    await pool.query(
      `
      INSERT INTO user_account
        (student_id, email, password_hash, role)
      VALUES
        ($1, $2, $3, 'student')
      `,
      [studentId, email, passwordHash]
    );

    return NextResponse.json(
      { message: "Student account created successfully." },
      { status: 201 }
    );
  } catch (error: unknown) {
    // PostgreSQL unique-constraint violation.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "An account already exists for these student details." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 }
    );
  }
}

