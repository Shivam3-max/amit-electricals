import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const banners = await db.banner.findMany({ orderBy: { slot: "asc" } });
  return NextResponse.json({ banners });
}
