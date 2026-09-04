import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAuth";
import { regenerateCatalog } from "@/lib/catalogRebuild";

export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const stats = await regenerateCatalog({ log: false });
  return NextResponse.json({ ok: true, stats });
}
