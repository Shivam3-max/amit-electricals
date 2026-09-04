import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departments } from "@/lib/catalog";
import { requireAdminApi } from "@/lib/adminAuth";

/**
 * Returns all seven department tiles, not just the ones with a photo —
 * slug and label come from the taxonomy (unchanged, never editable here),
 * merged with whatever image/active state exists in the database.
 */
export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const rows = await db.deptBanner.findMany();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const tiles = departments.map((d) => {
    const row = bySlug.get(d.slug);
    return { slug: d.slug, label: d.label, image: row?.image ?? "", active: row?.active ?? true };
  });
  return NextResponse.json({ tiles });
}
