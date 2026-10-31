import { createHmac, timingSafeEqual } from "crypto";

export type UserRole = "student" | "admin";

export type SessionUser = {
  user_id: number;
  student_id: number | null;
  email: string;
  role: UserRole;
};

const SESSION_DURATION = 60 * 60 * 24; // 24 hours

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      expires_at: Math.floor(Date.now() / 1000) + SESSION_DURATION,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string): SessionUser | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expected = sign(payload);

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (data.expires_at <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (
      !Number.isInteger(data.user_id) ||
      !["student", "admin"].includes(data.role)
    ) {
      return null;
    }

    return {
      user_id: data.user_id,
      student_id: data.student_id ?? null,
      email: data.email,
      role: data.role,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION,
};
