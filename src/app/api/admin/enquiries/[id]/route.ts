import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";

const STATUSES = new Set([
  "NEW",
  "REVIEWING",
  "QUOTED",
  "CONFIRMED",
  "DISPATCHED",
  "CLOSED",
  "CANCELLED",
]);

/** Update status, who's handling it, or the quoted total. */
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

  const data: Prisma.EnquiryUpdateInput = {};
  if (typeof body.status === "string") {
    if (!STATUSES.has(body.status)) return NextResponse.json({ error: "Bad status." }, { status: 422 });
    data.status = body.status as Prisma.EnumEnquiryStatusFieldUpdateOperationsInput["set"];
  }
  if (typeof body.assignedTo === "string") data.assignedTo = body.assignedTo.trim().slice(0, 80) || null;
  if (body.quotedTotal !== undefined) {
    const n = Number(body.quotedTotal);
    data.quotedTotal = Number.isFinite(n) ? n : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const enquiry = await db.enquiry.update({ where: { id }, data });
  return NextResponse.json({ enquiry });
}
