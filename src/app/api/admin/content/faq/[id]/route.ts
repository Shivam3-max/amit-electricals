import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.q === "string") data.q = body.q.trim().slice(0, 200);
  if (typeof body.a === "string") data.a = body.a.trim().slice(0, 1000);

  const faq = await db.faqEntry.update({ where: { id }, data });
  return NextResponse.json({ faq });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  await db.faqEntry.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
