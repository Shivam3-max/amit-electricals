import { NextResponse } from "next/server";
import { search } from "@/lib/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const dept = searchParams.get("dept") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const limit = Math.min(60, Number(searchParams.get("limit") ?? 12) || 12);

  return NextResponse.json({ q, results: search(q, { dept, brand, limit }) });
}
