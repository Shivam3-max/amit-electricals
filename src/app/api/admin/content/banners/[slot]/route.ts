import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

/** Upserts the banner in a given slot (1, 2 or 3 — matches the homepage carousel). */
export async function PUT(req: Request, { params }: { params: Promise<{ slot: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const slot = Number((await params).slot);
  if (!Number.isInteger(slot) || slot < 1) {
    return NextResponse.json({ error: "Bad slot." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const image = String(body.image ?? "").trim();
  const link = String(body.link ?? "").trim();
  const label = String(body.label ?? "").trim();
  const active = body.active !== false;

  const existing = await db.banner.findFirst({ where: { slot } });
  const data = { slot, image, link: link || null, label: label || null, active };

  const banner = existing
    ? await db.banner.update({ where: { id: existing.id }, data })
    : await db.banner.create({ data: { ...data, order: slot } });

  return NextResponse.json({ banner });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slot: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const slot = Number((await params).slot);
  await db.banner.deleteMany({ where: { slot } });
  return NextResponse.json({ ok: true });
}
