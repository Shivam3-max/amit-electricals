import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminAuth";
import { regenerateCatalog } from "@/lib/catalogRebuild";

const str = (v: unknown, max = 4000) => String(v ?? "").trim().slice(0, max);

/**
 * Creates or updates the admin override for one product, then regenerates
 * the static catalogue so the storefront reflects it immediately. `code`
 * is "new" for a brand-new (e.g. Rexsun) product — the body then needs the
 * full set of fields since there's no scraped record underneath it.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { code: codeParam } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const isNew = codeParam === "new";
  const code = isNew
    ? str(body.code, 40).toUpperCase() || `AEC-${Date.now().toString(36).toUpperCase()}`
    : codeParam;

  if (isNew && !str(body.name)) {
    return NextResponse.json({ errors: { name: "Product name is required." } }, { status: 422 });
  }

  const data = {
    code,
    name: str(body.name, 200) || undefined,
    description: str(body.description, 4000) || undefined,
    specsJson: body.specs ? JSON.stringify(body.specs) : undefined,
    imagesJson: body.images ? JSON.stringify(body.images) : undefined,
    stock: typeof body.stock === "string" ? body.stock : undefined,
    category: str(body.category, 80) || undefined,
    categorySlug: str(body.categorySlug, 80) || undefined,
    dept: typeof body.dept === "string" ? body.dept : undefined,
    brand: str(body.brand, 40) || undefined,
    isNew,
  };

  await db.productOverride.upsert({
    where: { code },
    create: data,
    update: data,
  });

  const stats = await regenerateCatalog({ log: false });
  return NextResponse.json({ ok: true, code, stats });
}

/** Deletes the override — an edited product reverts to its scraped data; a
 *  new product disappears from the catalogue entirely. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { code } = await params;
  await db.productOverride.delete({ where: { code } }).catch(() => null);
  const stats = await regenerateCatalog({ log: false });
  return NextResponse.json({ ok: true, stats });
}
