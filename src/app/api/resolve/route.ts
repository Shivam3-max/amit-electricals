import { NextResponse } from "next/server";
import { resolveCodes } from "@/lib/search";

export async function POST(req: Request) {
  let codes: unknown;
  try {
    ({ codes } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!Array.isArray(codes)) {
    return NextResponse.json({ error: "Expected { codes: string[] }." }, { status: 400 });
  }
  const list = codes.slice(0, 500).map((c) => String(c ?? ""));
  return NextResponse.json({ resolved: resolveCodes(list) });
}
