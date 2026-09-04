import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

/** Sets the quoted unit price on one line — the actual "quoting" action. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> },
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id, lineId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const unitPrice = body.unitPrice === null ? null : Number(body.unitPrice);
  if (unitPrice !== null && !Number.isFinite(unitPrice)) {
    return NextResponse.json({ error: "Price must be a number." }, { status: 422 });
  }

  const line = await db.enquiryLine.update({
    where: { id: lineId, enquiryId: id },
    data: { unitPrice },
  });
  return NextResponse.json({ line });
}
