import { NextResponse } from "next/server";
import { getCurrentDealer, publicDealer } from "@/lib/dealerAuth";

export async function GET() {
  const dealer = await getCurrentDealer();
  return NextResponse.json({ dealer: dealer ? publicDealer(dealer) : null });
}
