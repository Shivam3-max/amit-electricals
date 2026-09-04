import "server-only";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import type { Dealer } from "@prisma/client";

const COOKIE = "ae_dealer";
const SESSION_DAYS = 30;

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/** Creates a session row and sets the cookie on the current response. */
export async function startDealerSession(dealerId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.dealerSession.create({ data: { token, dealerId, expiresAt } });

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function endDealerSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.dealerSession.deleteMany({ where: { token } }).catch(() => null);
  jar.delete(COOKIE);
}

/** Reads the session cookie and returns the logged-in dealer, if any. */
export async function getCurrentDealer(): Promise<Dealer | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.dealerSession.findUnique({ where: { token }, include: { dealer: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.dealer;
}

/** Same lookup, keyed by phone — used to prevent duplicate registrations. */
export const findDealerByPhone = (phone: string) => db.dealer.findUnique({ where: { phone } });

/** Strip the password hash before a dealer record ever reaches the client. */
export function publicDealer(d: Dealer) {
  const { passwordHash: _passwordHash, ...rest } = d;
  return rest;
}
