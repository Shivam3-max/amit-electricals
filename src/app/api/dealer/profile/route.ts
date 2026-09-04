import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentDealer, publicDealer } from "@/lib/dealerAuth";

const str = (v: unknown, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** Update the saved profile fields that auto-fill future enquiries. */
export async function PATCH(req: Request) {
  const dealer = await getCurrentDealer();
  if (!dealer) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const company = str(body.company, 120);
  const contact = str(body.contact, 80);
  if (company.length < 2 || contact.length < 2) {
    return NextResponse.json(
      { errors: { company: "Firm name and contact name are required." } },
      { status: 422 },
    );
  }

  const updated = await db.dealer.update({
    where: { id: dealer.id },
    data: {
      company,
      contact,
      email: str(body.email, 120) || null,
      gstin: str(body.gstin, 20).toUpperCase() || null,
      city: str(body.city, 80) || null,
      address: str(body.address, 200) || null,
    },
  });

  return NextResponse.json({ dealer: publicDealer(updated) });
}
