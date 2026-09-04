import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "ae_admin";
const SESSION_DAYS = 14;

/** Constant-time compare so a login attempt can't be timed to guess the password. */
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD is not set — admin login is disabled until it is.");
    return false;
  }
  return safeEqual(password, expected);
}

export async function startAdminSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.adminSession.create({ data: { token, expiresAt } });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.adminSession.deleteMany({ where: { token } }).catch(() => null);
  jar.delete(COOKIE);
}

export async function isAdminSignedIn() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;

  const session = await db.adminSession.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return false;
  return true;
}

/** Call at the top of every protected admin page/layout. */
export async function requireAdmin() {
  if (!(await isAdminSignedIn())) redirect("/admin/login");
}

/** Same check for API routes, which return 401 instead of redirecting. */
export async function requireAdminApi() {
  if (!(await isAdminSignedIn())) {
    return new Response(JSON.stringify({ error: "Not signed in." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
