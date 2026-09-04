import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/CatalogView";
import { departments, getDepartment } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function generateStaticParams() {
  return departments.flatMap((d) => d.categories.map((c) => ({ dept: d.slug, cat: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string; cat: string }>;
}): Promise<Metadata> {
  const { dept, cat } = await params;
  const d = getDepartment(dept);
  const c = d?.categories.find((x) => x.slug === cat);
  if (!d || !c) return { title: "Not found" };
  return {
    title: `${c.label} — ${d.label}`,
    description: `${c.count} ${c.label.toLowerCase()} products from ${c.brands.join(", ")}, available for bulk enquiry from Amit Electricals.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ dept: string; cat: string }>;
  searchParams: Promise<SP>;
}) {
  const { dept, cat } = await params;
  const d = getDepartment(dept);
  const c = d?.categories.find((x) => x.slug === cat);
  if (!d || !c) notFound();
  const sp = await searchParams;

  const flat = {
    brand: one(sp.brand),
    spec: one(sp.spec),
    stock: one(sp.stock),
    sort: one(sp.sort),
    page: one(sp.page),
  };

  return (
    <CatalogView
      query={{ ...flat, dept, cat, page: Number(flat.page) || 1 }}
      crumbs={[
        { href: "/catalog", label: "Catalogue" },
        { href: `/catalog/${dept}`, label: d.label },
        { label: c.label },
      ]}
      eyebrow={`${d.label} · ${c.count} products`}
      title={c.label}
      intro={`Stocked from ${c.brands.join(", ")}. Add any line straight to an enquiry list — we quote against your rate contract.`}
      basePath={`/catalog/${dept}/${cat}`}
      searchParams={flat}
    />
  );
}
