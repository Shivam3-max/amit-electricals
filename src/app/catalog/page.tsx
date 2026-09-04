import type { Metadata } from "next";
import CatalogView from "@/components/CatalogView";
import { stats } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export const metadata: Metadata = {
  title: "Full catalogue",
  description:
    "Every line we stock across Surya, Polycab, Halonix and Indo — filter by brand, category and specification.",
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q);

  const flat = {
    q,
    brand: one(sp.brand),
    cat: one(sp.cat),
    stock: one(sp.stock),
    sort: one(sp.sort),
    page: one(sp.page),
  };

  return (
    <CatalogView
      query={{ ...flat, page: Number(flat.page) || 1 }}
      crumbs={[{ label: q ? `Search: ${q}` : "Catalogue" }]}
      eyebrow={q ? "Search results" : "Full catalogue"}
      title={q ? `Results for “${q}”` : "Everything we stock, in one place"}
      intro={
        q
          ? "Matched on product name, brand, category and catalogue code."
          : `${stats.products.toLocaleString("en-IN")} products across ${stats.departments} departments and ${stats.categories} categories. Narrow it down on the right, or jump straight to the order pad if you already know your codes.`
      }
      basePath="/catalog"
      searchParams={flat}
    />
  );
}
