import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";
import type { Prisma } from "@prisma/client";

const STATUSES = new Set(["NEW", "READ", "RESPONDED", "ARCHIVED"]);

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

  if (typeof body.status !== "string" || !STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Bad status." }, { status: 422 });
  }

  const message = await db.message.update({
    where: { id },
    data: { status: body.status as Prisma.EnumMessageStatusFieldUpdateOperationsInput["set"] },
  });
  return NextResponse.json({ message });
}
