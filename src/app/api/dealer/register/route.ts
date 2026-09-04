import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findDealerByPhone, hashPassword, publicDealer, startDealerSession } from "@/lib/dealerAuth";

const str = (v: unknown, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const PHONE_RE = /^[\d+][\d\s-]{7,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const company = str(body.company, 120);
  const contact = str(body.contact, 80);
  const phoneRaw = str(body.phone, 24);
  const phone = phoneRaw.replace(/[^\d+]/g, "");
  const password = String(body.password ?? "");
  const email = str(body.email, 120);
  const gstin = str(body.gstin, 20).toUpperCase();
  const city = str(body.city, 80);
  const address = str(body.address, 200);

  const errors: Record<string, string> = {};
  if (company.length < 2) errors.company = "Firm name is required.";
  if (contact.length < 2) errors.contact = "Your name is required.";
  if (!PHONE_RE.test(phoneRaw)) errors.phone = "Enter a reachable phone number.";
  if (password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const existing = await findDealerByPhone(phone);
  if (existing) {
    return NextResponse.json(
      { errors: { phone: "An account already exists for this phone number. Try logging in instead." } },
      { status: 409 },
    );
  }

  const dealer = await db.dealer.create({
    data: {
      company,
      contact,
      phone,
      email: email || null,
      gstin: gstin || null,
      city: city || null,
      address: address || null,
      passwordHash: await hashPassword(password),
    },
  });

  await startDealerSession(dealer.id);
  return NextResponse.json({ dealer: publicDealer(dealer) }, { status: 201 });
}
