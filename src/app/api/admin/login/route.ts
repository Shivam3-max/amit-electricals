import { NextResponse } from "next/server";
import { startAdminSession, verifyAdminPassword } from "@/lib/adminAuth";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await startAdminSession();
  return NextResponse.json({ ok: true });
}
