/**
 * Normalises the four brand feeds in ingest/data into one catalogue:
 *   src/data/catalog.json  - full records, server-side only
 *   src/data/index.json    - slim rows shipped to the browser for search/filter
 *   src/data/taxonomy.json - department -> category tree with counts
 *
 * Also layers in admin edits from the ProductOverride table (Prisma/SQLite):
 * an override with isNew=false patches fields onto a scraped product by
 * code; isNew=true is a product created entirely in the admin (Rexsun's
 * own range, or anything else not in the ingest feeds). Re-running this
 * after ingestion never loses an admin edit — the override table is the
 * source of truth for anything it touches.
 *
 * Run directly (`node scripts/build-catalog.mjs`) or imported and called
 * as `regenerateCatalog()` from the admin API after a save.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const BRANDS = ["polycab", "surya", "halonix", "indo"];
const NBSP = / /g;

const DEPARTMENTS = [
  { slug: "wires-cables", label: "Wires & Cables", blurb: "House wire, flexible, submersible and LV/MV power cable." },
  { slug: "lighting", label: "Lighting", blurb: "Lamps, battens, panels, downlighters, outdoor and industrial luminaires." },
  { slug: "fans", label: "Fans", blurb: "Ceiling, BLDC, exhaust, pedestal, wall, table and air circulators." },
  { slug: "switches", label: "Switches & Accessories", blurb: "Modular plates, boxes, plug tops and extension boards." },
  { slug: "switchgear", label: "Switchgear & Protection", blurb: "MCB, RCCB, RCBO, isolators, changeovers and distribution boards." },
  { slug: "appliances", label: "Appliances & Water Heating", blurb: "Geysers, room heaters, kitchen appliances and garment care." },
  { slug: "solar", label: "Solar & Green Energy", blurb: "Grid-tie inverters, solar cable, solar street lighting and pumps." },
];

const slug = (s) =>
  String(s || "")
    .replace(NBSP, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ACRONYMS = /\b(Led|Mcb|Rccb|Rcbo|Cob|Gls|Ftl|Bldc|Uvc|Hid|Cfl|Accl|Iot|Lv|Mv|Ehv|Pvc|Erw|Dj|Ip|Bee|T5|T8)\b/gi;

const title = (s) =>
  String(s || "")
    .replace(NBSP, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])([a-z']*)/gi, (_, a, b) => a.toUpperCase() + b.toLowerCase())
    .replace(ACRONYMS, (m) => m.toUpperCase())
    .replace(/\bAnd\b/g, "and");

/** Route a raw brand category path to one of our departments. */
function department(brand, path) {
  const p = path.map((x) => String(x).toLowerCase()).join(" / ");
  const has = (...w) => w.some((x) => p.includes(x));

  if (has("solar") && !has("heater", "water", "geyser")) return "solar";
  if (has("wire", "cable")) return "wires-cables";
  if (has("switchgear", "mcb", "rccb", "rcbo", "isolator", "distribution board", "changeover", "accl"))
    return "switchgear";
  if (has("extension board", "plug", "modular box", "switches and accessories", "levana", "etira"))
    return "switches";
  if (has("fan", "air circulator", "farrata", "climate control", "cooling")) return "fans";
  if (has("iron", "immersion", "water heater", "geyser", "room heater", "heating appliance",
          "sanitis", "solar heater",
          "food preparation", "garment care", "cooking range", "kitchen", "mosquito",
          "mixer", "kettle", "air fryer", "induction", "cooktop", "appliance"))
    return "appliances";
  if (has("light", "lamp", "batten", "panel", "downlight", "luminaire", "torch", "cob",
          "bulb", "flood", "street", "bulkhead", "gls", "ftl", "ballast", "smart iot"))
    return "lighting";
  return "lighting";
}

/** Human category label = the most specific meaningful segment of the brand path. */
const NOISE = new Set([
  "lighting", "led lights", "consumer lighting", "professional lighting", "institutional lighting",
  "home appliances", "fans", "wires", "switchgear", "switchgears", "solar",
  "switches and accessories", "safety security", "lights", "smart iot", "conventional light",
  "prime products", "non prime products", "conventional lights", "led", "products",
]);

function category(path, dept) {
  const parts = path.map((x) => String(x).replace(NBSP, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!NOISE.has(parts[i].toLowerCase())) return title(parts[i]);
  }
  return DEPARTMENTS.find((d) => d.slug === dept).label;
}

/** Series/range name — Polycab wires and switches are sold by range, so keep it. */
const series = (path) => (path.length > 1 ? title(path[1]) : "");

const NUM = /(-?\d+(?:\.\d+)?)/;

/** Turn a brand variant table into orderable rows. */
function variants(vts) {
  const out = [];
  for (const t of vts || []) {
    const heads = (t.headers || []).map((h) => String(h).replace(NBSP, " ").trim());
    if (!heads.length || !t.rows?.length) continue;
    const iBox = heads.findIndex((h) => /box\s*qty|packing|pack/i.test(h));
    const iMrp = heads.findIndex((h) => /mrp|price/i.test(h));
    for (const row of t.rows) {
      if (row.length < 2 || row.every((c) => !c)) continue;
      const attrs = {};
      heads.forEach((h, i) => {
        const v = String(row[i] ?? "").replace(NBSP, " ").trim();
        if (v && v !== "-" && i !== iBox && i !== iMrp) attrs[h] = v;
      });
      const label = Object.values(attrs)[0] || "Standard";
      const box = iBox >= 0 ? parseInt(String(row[iBox] || "").match(NUM)?.[1] ?? "", 10) : NaN;
      const mrp = iMrp >= 0 ? parseFloat(String(row[iMrp] || "").replace(/[^\d.]/g, "")) : NaN;
      out.push({
        label: String(label).slice(0, 60),
        attrs,
        boxQty: Number.isFinite(box) ? box : null,
        mrp: Number.isFinite(mrp) ? mrp : null,
      });
    }
  }
  const seen = new Set();
  return out
    .filter((v) => {
      const k = v.label + JSON.stringify(v.attrs);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 60);
}

/** Pull filterable values out of free-form spec maps. */
const FACET_RULES = [
  ["wattage", /^(power|wattage|power input|watt)/i],
  ["sweep", /sweep/i],
  ["airDelivery", /air delivery/i],
  ["speed", /speed|rpm/i],
  ["lumens", /lumen/i],
  ["colourTemp", /colour temp|color temp|cct|kelvin/i],
  ["current", /current rating|amp|\bamps\b/i],
  ["poles", /pole/i],
  ["capacity", /capacity|litre|liter/i],
  ["ip", /\bip\b|ingress/i],
  ["warranty", /warranty/i],
  ["blades", /blade/i],
  ["coreSize", /sq\.?\s*mm|cross section|size/i],
];

function facets(specs, variantRows) {
  const f = {};
  for (const [k, re] of FACET_RULES) {
    for (const [key, val] of Object.entries(specs || {})) {
      if (re.test(key) && val) {
        f[k] = String(val).replace(NBSP, " ").trim();
        break;
      }
    }
  }
  if (!f.wattage) {
    for (const v of variantRows) {
      const hit = Object.entries(v.attrs).find(([k]) => /watt/i.test(k));
      if (hit) {
        f.wattage = String(hit[1]);
        break;
      }
    }
  }
  return f;
}

export const BRAND_META = {
  Polycab: { slug: "polycab", label: "Polycab", note: "Wires, cables, switchgear, fans and lighting." },
  Surya: { slug: "surya", label: "Surya", note: "Lighting, fans and home appliances." },
  Halonix: { slug: "halonix", label: "Halonix", note: "LED lighting, fans, switchgear and inverter range." },
  Indo: { slug: "indo", label: "Indo", note: "Water heating, room heating and kitchen appliances." },
  Rexsun: { slug: "rexsun", label: "Rexsun", note: "Our own label." },
};

export const DEPT_LIST = DEPARTMENTS;
export { slug as slugify, title as titleCase };

/**
 * Builds and writes src/data/{catalog,index,taxonomy,brands}.json.
 * Returns summary stats. Safe to call repeatedly (e.g. after every admin save).
 */
export async function regenerateCatalog({ log = true } = {}) {
  const say = (...a) => log && console.log(...a);
  const prisma = new PrismaClient();

  let overrides = [];
  try {
    overrides = await prisma.productOverride.findMany();
  } catch (err) {
    say("  (no overrides applied — database unavailable:", err.message, ")");
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
  const overrideByCode = new Map(overrides.filter((o) => !o.isNew).map((o) => [o.code, o]));
  const newProducts = overrides.filter((o) => o.isNew);

  const products = [];
  const codes = new Set();
  const slugs = new Set();

  for (const b of BRANDS) {
    const file = `ingest/data/${b}.json`;
    if (!fs.existsSync(file)) {
      say("missing", file);
      continue;
    }
    for (const r of JSON.parse(fs.readFileSync(file, "utf8"))) {
      const path = (r.category_path || [])
        .map((x) => String(x).replace(NBSP, " ").trim())
        .filter(Boolean);
      const dept = department(b, path);
      const cat = category(path, dept);
      const vr = variants(r.variant_tables);

      let code = String(r.sku || "").toUpperCase().replace(/\s+/g, "");
      if (!code) {
        const h = crypto.createHash("sha1").update(b + r.name + r.source).digest("hex").slice(0, 6);
        code = `${(BRAND_META[title(r.brand)]?.slug || "aec").slice(0, 3).toUpperCase()}-${h.toUpperCase()}`;
      }
      while (codes.has(code)) code += "A";
      codes.add(code);

      let s = slug(r.name) || slug(code);
      if (slugs.has(s)) s = `${s}-${slug(code)}`;
      slugs.add(s);

      const product = {
        code,
        slug: s,
        name: String(r.name).replace(NBSP, " ").replace(/\s*\|\s*/g, " · ").replace(/\s+/g, " ").trim(),
        brand: title(r.brand),
        dept,
        category: cat,
        categorySlug: slug(cat),
        series: series(path),
        description: String(r.description || "").replace(NBSP, " ").trim(),
        specs: Object.fromEntries(
          Object.entries(r.specs || {}).map(([k, v]) => [
            String(k).replace(NBSP, " ").trim(),
            String(v).replace(NBSP, " ").trim(),
          ]),
        ),
        variants: vr,
        facets: facets(r.specs, vr),
        mrp: r.mrp ? Number(String(r.mrp).replace(/[^\d.]/g, "")) || null : null,
        stock: r.availability === "OutOfStock" ? "indent" : "in-stock",
        images: r.images || [],
        localImages: r.local_images || [],
        source: r.source,
        rawPath: path,
      };

      const ov = overrideByCode.get(code);
      if (ov) applyOverride(product, ov);

      products.push(product);
    }
  }

  // Admin-created products (Rexsun and anything else with no ingest feed).
  for (const ov of newProducts) {
    let code = ov.code || `AEC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    while (codes.has(code)) code += "A";
    codes.add(code);

    let s = slug(ov.name) || slug(code);
    if (slugs.has(s)) s = `${s}-${slug(code)}`;
    slugs.add(s);

    const brand = ov.brand || "Rexsun";
    const dept = ov.dept || "lighting";
    const cat = ov.category || DEPARTMENTS.find((d) => d.slug === dept)?.label || dept;

    const product = {
      code,
      slug: s,
      name: ov.name || "Untitled product",
      brand,
      dept,
      category: cat,
      categorySlug: ov.categorySlug || slug(cat),
      series: brand,
      description: ov.description || "",
      specs: safeParse(ov.specsJson, {}),
      variants: [],
      facets: {},
      mrp: null,
      stock: ov.stock || "in-stock",
      images: [],
      localImages: safeParse(ov.imagesJson, []),
      source: "admin",
      rawPath: [dept, cat],
    };
    products.push(product);
  }

  const taxonomy = DEPARTMENTS.map((d) => {
    const rows = products.filter((p) => p.dept === d.slug);
    const cats = {};
    for (const p of rows) {
      cats[p.categorySlug] ??= { slug: p.categorySlug, label: p.category, count: 0, brands: new Set() };
      cats[p.categorySlug].count++;
      cats[p.categorySlug].brands.add(p.brand);
    }
    return {
      ...d,
      count: rows.length,
      brands: [...new Set(rows.map((p) => p.brand))].sort(),
      categories: Object.values(cats)
        .map((c) => ({ ...c, brands: [...c.brands].sort() }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    };
  });

  const index = products.map((p) => ({
    c: p.code,
    s: p.slug,
    n: p.name,
    b: p.brand,
    d: p.dept,
    k: p.categorySlug,
    kl: p.category,
    w: p.facets.wattage || "",
    v: p.variants.length,
    st: p.stock,
    i: p.localImages[0] || "",
  }));

  fs.mkdirSync("src/data", { recursive: true });
  fs.writeFileSync("src/data/catalog.json", JSON.stringify(products));
  fs.writeFileSync("src/data/index.json", JSON.stringify(index));
  fs.writeFileSync("src/data/taxonomy.json", JSON.stringify(taxonomy, null, 1));
  fs.writeFileSync("src/data/brands.json", JSON.stringify(Object.values(BRAND_META), null, 1));

  const stats = {
    products: products.length,
    overridesApplied: overrideByCode.size,
    newProducts: newProducts.length,
  };
  say(`products      ${stats.products}`);
  say(`overrides     ${stats.overridesApplied} applied, ${stats.newProducts} new`);
  for (const d of taxonomy) {
    say(`  ${d.slug.padEnd(14)} ${String(d.count).padStart(5)}  ${String(d.categories.length).padStart(3)} cats  ${d.brands.join(", ")}`);
  }
  return stats;
}

/** Patches a scraped product in place with whichever override fields are set. */
function applyOverride(product, ov) {
  if (ov.name) product.name = ov.name;
  if (ov.description) product.description = ov.description;
  if (ov.specsJson) product.specs = safeParse(ov.specsJson, product.specs);
  if (ov.imagesJson) product.localImages = safeParse(ov.imagesJson, product.localImages);
  if (ov.stock) product.stock = ov.stock;
  if (ov.brand) product.brand = ov.brand;
  if (ov.dept) product.dept = ov.dept;
  if (ov.category) product.category = ov.category;
  if (ov.categorySlug) product.categorySlug = ov.categorySlug;
}

function safeParse(json, fallback) {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Run directly: `node scripts/build-catalog.mjs` — compared as decoded paths
// since a project path with spaces (%20 in the URL) breaks a raw string match.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  regenerateCatalog().then(() => process.exit(0));
}
