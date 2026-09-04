import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentDealer } from "@/lib/dealerAuth";

/**
 * Enquiry intake. The platform never takes payment — a submitted list becomes
 * a proforma request that the counter team prices and confirms. Signed-in
 * dealers get the enquiry linked to their account (so it shows up in their
 * order history and the admin's dealer view); anyone else can still submit
 * one with just their details typed in, same as before.
 */

const str = (v: unknown, max = 240) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

type Line = { code: string; name: string; brand: string; variant: string | null; qty: number; uom: string; note: string };

function reference() {
  const d = new Date();
  const stamp = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  return `AE-${stamp}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const company = str(body.company, 120);
  const contact = str(body.contact, 80);
  const phone = str(body.phone, 24);
  const rawLines = Array.isArray(body.lines) ? body.lines : [];

  const errors: Record<string, string> = {};
  if (company.length < 2) errors.company = "Firm name is required.";
  if (contact.length < 2) errors.contact = "Contact name is required.";
  if (!/^[\d+][\d\s-]{7,}$/.test(phone)) errors.phone = "Enter a reachable phone number.";
  if (!rawLines.length) errors.lines = "Add at least one item before submitting.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const lines: Line[] = rawLines.slice(0, 500).map((l) => {
    const r = (l ?? {}) as Record<string, unknown>;
    return {
      code: str(r.code, 40),
      name: str(r.name, 200),
      brand: str(r.brand, 40),
      variant: r.variant ? str(r.variant, 80) : null,
      qty: Math.max(1, Math.min(999999, Math.round(Number(r.qty) || 1))),
      uom: r.uom === "box" ? "box" : "pcs",
      note: str(r.note, 200),
    };
  });

  const dealer = await getCurrentDealer();

  try {
    const enquiry = await db.enquiry.create({
      data: {
        ref: reference(),
        dealerId: dealer?.id,
        company,
        contact,
        phone,
        email: str(body.email, 120) || null,
        gstin: str(body.gstin, 20).toUpperCase() || null,
        city: str(body.city, 80) || null,
        site: str(body.site, 120) || null,
        deliverBy: str(body.deliverBy, 40) || null,
        purpose: str(body.purpose, 40) || "resale",
        notes: str(body.notes, 1200) || null,
        listName: str(body.listName, 80) || null,
        lines: { create: lines },
      },
      include: { lines: true },
    });

    return NextResponse.json({
      ref: enquiry.ref,
      lineCount: enquiry.lines.length,
      units: enquiry.lines.reduce((n, l) => n + l.qty, 0),
    });
  } catch (err) {
    console.error("enquiry write failed", err);
    return NextResponse.json(
      { error: "Could not record the enquiry. Please call the counter." },
      { status: 500 },
    );
  }
}
