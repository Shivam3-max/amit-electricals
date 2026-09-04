import { NextResponse } from "next/server";
import { endDealerSession } from "@/lib/dealerAuth";

export async function POST() {
  await endDealerSession();
  return NextResponse.json({ ok: true });
}
