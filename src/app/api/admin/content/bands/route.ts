import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGiftBands } from "@/lib/content";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const bands = await getGiftBands();
  return NextResponse.json({ bands });
}

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const range = String(body.range ?? "").trim().slice(0, 60);
  const note = String(body.note ?? "").trim().slice(0, 160);
  if (!range) return NextResponse.json({ error: "Band label is required." }, { status: 422 });

  const maxOrder = await db.giftBand.aggregate({ _max: { order: true } });
  const band = await db.giftBand.create({
    data: { range, note, codesJson: "[]", order: (maxOrder._max.order ?? -1) + 1 },
  });
  return NextResponse.json({ band: { ...band, codes: [] } });
}
