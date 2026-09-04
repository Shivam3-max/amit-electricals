import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { requireAdminApi } from "@/lib/adminAuth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 8 * 1024 * 1024;

/** Saves one product photo under public/products/<brand>/, returns its public path. */
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const brandSlug = String(form.get("brand") ?? "misc").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "misc";
  const code = String(form.get("code") ?? "item").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "item";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8MB." }, { status: 422 });
  }

  const ext = EXT[file.type];
  const name = `${code}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "products", brandSlug);
  fs.mkdirSync(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), bytes);

  return NextResponse.json({ path: `/products/${brandSlug}/${name}` });
}
