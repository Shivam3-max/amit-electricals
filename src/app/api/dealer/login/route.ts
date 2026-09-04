import { NextResponse } from "next/server";
import { findDealerByPhone, publicDealer, startDealerSession, verifyPassword } from "@/lib/dealerAuth";

const str = (v: unknown, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = str(body.phone, 24).replace(/[^\d+]/g, "");
  const password = String(body.password ?? "");

  if (!phone || !password) {
    return NextResponse.json({ error: "Enter your phone number and password." }, { status: 422 });
  }

  const dealer = await findDealerByPhone(phone);
  const ok = dealer && (await verifyPassword(password, dealer.passwordHash));
  if (!dealer || !ok) {
    return NextResponse.json({ error: "Phone number or password is incorrect." }, { status: 401 });
  }

  await startDealerSession(dealer.id);
  return NextResponse.json({ dealer: publicDealer(dealer) });
}
