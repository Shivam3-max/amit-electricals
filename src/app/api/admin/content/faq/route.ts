import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFaqs } from "@/lib/content";
import { requireAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const faqs = await getFaqs();
  return NextResponse.json({ faqs });
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

  const q = String(body.q ?? "").trim().slice(0, 200);
  const a = String(body.a ?? "").trim().slice(0, 1000);
  if (!q || !a) return NextResponse.json({ error: "Question and answer are both required." }, { status: 422 });

  const maxOrder = await db.faqEntry.aggregate({ _max: { order: true } });
  const faq = await db.faqEntry.create({ data: { q, a, order: (maxOrder._max.order ?? -1) + 1 } });
  return NextResponse.json({ faq });
}
