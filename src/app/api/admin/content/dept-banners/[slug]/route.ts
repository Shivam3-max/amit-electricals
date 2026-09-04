import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

/** Upserts the photo for one department tile, keyed by its taxonomy slug. */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const image = String(body.image ?? "").trim();
  if (!image) return NextResponse.json({ error: "An image is required." }, { status: 422 });
  const active = body.active !== false;

  const existing = await db.deptBanner.findUnique({ where: { slug } });
  const banner = existing
    ? await db.deptBanner.update({ where: { slug }, data: { image, active } })
    : await db.deptBanner.create({ data: { slug, image, active } });

  return NextResponse.json({ banner });
}

/** Removes the photo — the tile reverts to its brand-gradient placeholder. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { slug } = await params;
  await db.deptBanner.deleteMany({ where: { slug } });
  return NextResponse.json({ ok: true });
}
