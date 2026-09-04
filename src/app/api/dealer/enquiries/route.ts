import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentDealer } from "@/lib/dealerAuth";

export async function GET() {
  const dealer = await getCurrentDealer();
  if (!dealer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const enquiries = await db.enquiry.findMany({
    where: { dealerId: dealer.id },
    orderBy: { receivedAt: "desc" },
    include: { lines: true },
    take: 100,
  });

  return NextResponse.json({ enquiries });
}
