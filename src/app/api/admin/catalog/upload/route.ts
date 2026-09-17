import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAuth";
import { db } from "@/lib/db";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 8 * 1024 * 1024;

/** Stores an uploaded image in MySQL so it survives Hostinger redeployments. */
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8MB." }, { status: 422 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = EXT[file.type];
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "image";
  const asset = await db.uploadedAsset.create({
    data: {
      fileName: `${baseName}.${ext}`,
      mimeType: file.type,
      bytes,
    },
    select: { id: true },
  });

  return NextResponse.json({ path: `/api/assets/${asset.id}` });
}
