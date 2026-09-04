import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";

/**
 * General-purpose message intake, shared by the contact page and the
 * become-a-dealer page (distinguished by `topic`). Same durable-record
 * pattern as the enquiry route — this is not a sales channel, just a way
 * for a person to reach the counter without a phone call.
 */

const str = (v: unknown, max = 240) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const TOPICS = new Set(["general", "dealer", "gifting"]);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = str(body.name, 80);
  const phone = str(body.phone, 24);
  const message = str(body.message, 2000);
  const topic = TOPICS.has(String(body.topic)) ? String(body.topic) : "general";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Your name is required.";
  if (!/^[\d+][\d\s-]{7,}$/.test(phone)) errors.phone = "Enter a reachable phone number.";
  if (message.length < 5) errors.message = "Tell us a little about what you need.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const ref = `MSG-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    await db.message.create({
      data: {
        ref,
        topic,
        name,
        phone,
        email: str(body.email, 120) || null,
        company: str(body.company, 120) || null,
        city: str(body.city, 80) || null,
        message,
      },
    });
  } catch (err) {
    console.error("message write failed", err);
    return NextResponse.json(
      { error: "Could not send that. Please call the counter directly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ref });
}
