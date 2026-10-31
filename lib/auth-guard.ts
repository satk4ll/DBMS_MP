import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifySession, type SessionUser, type UserRole } from "@/lib/auth";

export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("skillsync_session")?.value;

    if (!token) return null;

    const session = verifySession(token);

    if (!session) return null;

    const result = await pool.query(
      `SELECT user_id, student_id, email, role
       FROM user_account
       WHERE user_id = $1`,
      [session.user_id]
    );

    if (result.rowCount !== 1) return null;

    const account = result.rows[0];

    if (
      account.role !== session.role ||
      account.email !== session.email
    ) {
      return null;
    }

    return {
      user_id: Number(account.user_id),
      student_id:
        account.student_id === null
          ? null
          : Number(account.student_id),
      email: account.email,
      role: account.role,
    };
  } catch (error) {
    console.error("Authentication check failed:", error);
    return null;
  }
}

export async function requireRole(role: UserRole) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== role) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

