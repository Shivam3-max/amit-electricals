import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";
import type { Prisma } from "@prisma/client";

const TIERS = new Set(["RETAILER", "DEALER", "PROJECT"]);
const STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);

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

  const data: Prisma.DealerUpdateInput = {};
  if (typeof body.tier === "string") {
    if (!TIERS.has(body.tier)) return NextResponse.json({ error: "Bad tier." }, { status: 422 });
    data.tier = body.tier as Prisma.EnumDealerTierFieldUpdateOperationsInput["set"];
  }
  if (typeof body.status === "string") {
    if (!STATUSES.has(body.status)) return NextResponse.json({ error: "Bad status." }, { status: 422 });
    data.status = body.status as Prisma.EnumDealerStatusFieldUpdateOperationsInput["set"];
  }
  if (typeof body.notes === "string") data.notes = body.notes.trim().slice(0, 2000) || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const dealer = await db.dealer.update({ where: { id }, data });
  return NextResponse.json({ dealer });
}
