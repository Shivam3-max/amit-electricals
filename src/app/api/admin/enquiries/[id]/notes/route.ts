import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = String(body.text ?? "").trim().slice(0, 2000);
  const author = String(body.author ?? "Counter").trim().slice(0, 60) || "Counter";
  if (text.length < 1) return NextResponse.json({ error: "Note is empty." }, { status: 422 });

  const note = await db.internalNote.create({ data: { enquiryId: id, author, text } });
  return NextResponse.json({ note });
}
