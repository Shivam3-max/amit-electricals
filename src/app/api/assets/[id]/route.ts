import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await db.uploadedAsset.findUnique({
    where: { id },
    select: { bytes: true, mimeType: true, fileName: true },
  });

  if (!asset) return new Response("Not found", { status: 404 });

  return new Response(asset.bytes, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": `inline; filename="${asset.fileName.replace(/["\\]/g, "")}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
