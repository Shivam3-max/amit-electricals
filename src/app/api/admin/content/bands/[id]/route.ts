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
  if (typeof body.range === "string") data.range = body.range.trim().slice(0, 60);
  if (typeof body.note === "string") data.note = body.note.trim().slice(0, 160);
  if (Array.isArray(body.codes)) {
    data.codesJson = JSON.stringify(body.codes.map((c) => String(c).toUpperCase().trim()).filter(Boolean).slice(0, 20));
  }

  const band = await db.giftBand.update({ where: { id }, data });
  return NextResponse.json({ band: { ...band, codes: JSON.parse(band.codesJson) } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  await db.giftBand.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
