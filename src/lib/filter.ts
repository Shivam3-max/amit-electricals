import { catalog, toIndexRow } from "./catalog";
import { search } from "./search";
import type { Product } from "./types";

export type Query = {
  q?: string;
  dept?: string;
  cat?: string;
  brand?: string;
  /** Extra spec facet, e.g. `spec=wattage:16-30`. */
  spec?: string;
  stock?: string;
  sort?: string;
  page?: number;
};

export type FacetOption = { value: string; label: string; count: number };
export type FacetGroup = { key: string; label: string; options: FacetOption[] };

export const PER_PAGE = 36;

/** Numeric buckets, chosen to match how the trade actually asks for a size. */
const BUCKETS: Record<string, { label: string; test: (n: number) => boolean }[]> = {
  wattage: [
    { label: "Up to 5W", test: (n) => n <= 5 },
    { label: "6 – 15W", test: (n) => n > 5 && n <= 15 },
    { label: "16 – 30W", test: (n) => n > 15 && n <= 30 },
    { label: "31 – 60W", test: (n) => n > 30 && n <= 60 },
    { label: "61 – 120W", test: (n) => n > 60 && n <= 120 },
    { label: "Above 120W", test: (n) => n > 120 },
  ],
  sweep: [
    { label: "Up to 300mm", test: (n) => n <= 300 },
    { label: "301 – 600mm", test: (n) => n > 300 && n <= 600 },
    { label: "601 – 1200mm", test: (n) => n > 600 && n <= 1200 },
    { label: "Above 1200mm", test: (n) => n > 1200 },
  ],
  current: [
    { label: "Up to 10A", test: (n) => n <= 10 },
    { label: "11 – 32A", test: (n) => n > 10 && n <= 32 },
    { label: "33 – 63A", test: (n) => n > 32 && n <= 63 },
    { label: "Above 63A", test: (n) => n > 63 },
  ],
  capacity: [
    { label: "Up to 6 L", test: (n) => n <= 6 },
    { label: "7 – 15 L", test: (n) => n > 6 && n <= 15 },
    { label: "16 – 25 L", test: (n) => n > 15 && n <= 25 },
    { label: "Above 25 L", test: (n) => n > 25 },
  ],
};

/** Which extra facet is worth showing, per department. */
const DEPT_FACET: Record<string, { key: string; label: string }> = {
  lighting: { key: "wattage", label: "Wattage" },
  fans: { key: "sweep", label: "Sweep size" },
  switchgear: { key: "current", label: "Current rating" },
  appliances: { key: "capacity", label: "Capacity" },
  solar: { key: "wattage", label: "Rating" },
  switches: { key: "wattage", label: "Rating" },
  "wires-cables": { key: "coreSize", label: "Core size" },
};

const numberIn = (v?: string) => {
  const m = String(v ?? "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
};

/** Bucket label for a product on a given facet, or null when unknown. */
function bucketOf(p: Product, key: string): string | null {
  const raw = p.facets[key];
  if (!raw) return null;
  const buckets = BUCKETS[key];
  if (!buckets) return raw.length > 24 ? null : raw;
  const n = numberIn(raw);
  if (!Number.isFinite(n)) return null;
  return buckets.find((b) => b.test(n))?.label ?? null;
}

export function runQuery(query: Query) {
  const { q, dept, cat, brand, spec, stock, sort = "relevance", page = 1 } = query;

  // A text query defines both the pool and its natural ordering.
  let pool: Product[];
  let ranked = false;
  if (q?.trim()) {
    const codes = new Set(search(q, { limit: 600 }).map((r) => r.c));
    const order = [...codes];
    pool = catalog.filter((p) => codes.has(p.code));
    pool.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    ranked = true;
  } else {
    pool = catalog;
  }

  if (dept) pool = pool.filter((p) => p.dept === dept);
  if (cat) pool = pool.filter((p) => p.categorySlug === cat);

  // Facet counts are computed before that facet is applied, so a shopper can
  // see the size of the other options in the same group.
  const countBy = <T,>(rows: Product[], get: (p: Product) => T | null) => {
    const m = new Map<T, number>();
    for (const p of rows) {
      const v = get(p);
      if (v === null || v === undefined || v === "") continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return m;
  };

  const afterBrand = brand ? pool.filter((p) => p.brand === brand) : pool;
  const specKey = dept ? DEPT_FACET[dept]?.key : undefined;
  const afterSpec =
    spec && specKey
      ? afterBrand.filter((p) => bucketOf(p, specKey) === spec)
      : afterBrand;
  const results = stock ? afterSpec.filter((p) => p.stock === stock) : afterSpec;

  const groups: FacetGroup[] = [];

  const brandCounts = countBy(
    spec && specKey ? pool.filter((p) => bucketOf(p, specKey) === spec) : pool,
    (p) => p.brand,
  );
  if (brandCounts.size > 1) {
    groups.push({
      key: "brand",
      label: "Brand",
      options: [...brandCounts.entries()]
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
    });
  }

  if (!cat) {
    const catCounts = countBy(afterBrand, (p) => `${p.categorySlug}|${p.category}`);
    if (catCounts.size > 1) {
      groups.push({
        key: "cat",
        label: "Category",
        options: [...catCounts.entries()]
          .map(([k, count]) => {
            const [value, label] = k.split("|");
            return { value, label, count };
          })
          .sort((a, b) => b.count - a.count),
      });
    }
  }

  if (specKey) {
    const order = BUCKETS[specKey]?.map((b) => b.label);
    const specCounts = countBy(afterBrand, (p) => bucketOf(p, specKey));
    if (specCounts.size > 1) {
      const options = [...specCounts.entries()].map(([value, count]) => ({
        value,
        label: value,
        count,
      }));
      options.sort((a, b) =>
        order
          ? order.indexOf(a.value) - order.indexOf(b.value)
          : b.count - a.count || a.label.localeCompare(b.label),
      );
      groups.push({
        key: "spec",
        label: DEPT_FACET[dept!].label,
        options: options.slice(0, 14),
      });
    }
  }

  const stockCounts = countBy(afterSpec, (p) => p.stock);
  if (stockCounts.size > 1) {
    groups.push({
      key: "stock",
      label: "Availability",
      options: [
        { value: "in-stock", label: "In stock", count: stockCounts.get("in-stock") ?? 0 },
        { value: "indent", label: "On indent", count: stockCounts.get("indent") ?? 0 },
      ].filter((o) => o.count > 0),
    });
  }

  const sorted = [...results];
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "brand")
    sorted.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  else if (sort === "variants") sorted.sort((a, b) => b.variants.length - a.variants.length);
  else if (!ranked)
    // Default browse order: richest records first, so specs and variants show up.
    sorted.sort(
      (a, b) =>
        b.variants.length - a.variants.length ||
        Object.keys(b.specs).length - Object.keys(a.specs).length ||
        a.name.localeCompare(b.name),
    );

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const rows = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE).map(toIndexRow);

  return { rows, total: sorted.length, page: current, pages, groups };
}

export const deptFacetLabel = (dept?: string) =>
  dept ? DEPT_FACET[dept]?.label : undefined;
