import catalogJson from "@/data/catalog.json";
import indexJson from "@/data/index.json";
import taxonomyJson from "@/data/taxonomy.json";
import brandsJson from "@/data/brands.json";
import type { BrandMeta, Department, IndexRow, Product } from "./types";

export const catalog = catalogJson as unknown as Product[];
export const catalogIndex = indexJson as unknown as IndexRow[];
export const departments = taxonomyJson as unknown as Department[];
export const brands = brandsJson as unknown as BrandMeta[];

const bySlug = new Map(catalog.map((p) => [p.slug, p]));
const byCode = new Map(catalog.map((p) => [p.code.toUpperCase(), p]));
const deptBySlug = new Map(departments.map((d) => [d.slug, d]));
const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

export const toIndexRow = (p: Product): IndexRow => ({
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
});

export const getProduct = (slug: string) => bySlug.get(slug);
export const getByCode = (code: string) => byCode.get(code.trim().toUpperCase());
export const getDepartment = (slug: string) => deptBySlug.get(slug);
export const getBrand = (slug: string) => brandBySlug.get(slug);

export const brandLabel = (slug: string) => brandBySlug.get(slug)?.label ?? slug;

export function productsIn(dept: string, category?: string) {
  return catalog.filter(
    (p) => p.dept === dept && (!category || p.categorySlug === category),
  );
}

export function productsByBrand(label: string) {
  return catalog.filter((p) => p.brand === label);
}

/** Counts used across the site for headline stats. */
export const stats = {
  products: catalog.length,
  departments: departments.length,
  categories: departments.reduce((n, d) => n + d.categories.length, 0),
  brands: brands.length,
  skus: catalog.reduce((n, p) => n + Math.max(1, p.variants.length), 0),
};

/**
 * Related products: same category first, then same brand within the department.
 */
export function related(p: Product, limit = 6) {
  const pool = catalog.filter((q) => q.slug !== p.slug);
  const score = (q: Product) =>
    (q.categorySlug === p.categorySlug ? 4 : 0) +
    (q.brand === p.brand ? 2 : 0) +
    (q.dept === p.dept ? 1 : 0) +
    (q.series && q.series === p.series ? 2 : 0);
  return pool
    .map((q) => [score(q), q] as const)
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, q]) => q);
}

/**
 * Cross-brand alternatives on the same category — powers the "compare across
 * brands" tray, which is the core reason a trade buyer uses one platform.
 */
export function alternatives(p: Product, limit = 4) {
  return catalog
    .filter((q) => q.categorySlug === p.categorySlug && q.brand !== p.brand)
    .slice(0, limit);
}

export const deptLabel = (slug: string) => deptBySlug.get(slug)?.label ?? slug;
