import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CatalogView from "@/components/CatalogView";
import { departments, getDepartment } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function generateStaticParams() {
  return departments.map((d) => ({ dept: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const d = getDepartment((await params).dept);
  if (!d) return { title: "Not found" };
  return {
    title: d.label,
    description: `${d.count} ${d.label.toLowerCase()} products from ${d.brands.join(", ")}. ${d.blurb}`,
  };
}

export default async function DeptPage({
  params,
  searchParams,
}: {
  params: Promise<{ dept: string }>;
  searchParams: Promise<SP>;
}) {
  const { dept } = await params;
  const d = getDepartment(dept);
  if (!d) notFound();
  const sp = await searchParams;

  const flat = {
    brand: one(sp.brand),
    cat: one(sp.cat),
    spec: one(sp.spec),
    stock: one(sp.stock),
    sort: one(sp.sort),
    page: one(sp.page),
  };

  return (
    <CatalogView
      query={{ ...flat, dept, page: Number(flat.page) || 1 }}
      crumbs={[{ href: "/catalog", label: "Catalogue" }, { label: d.label }]}
      eyebrow={`${d.count} products · ${d.brands.join(" · ")}`}
      title={d.label}
      intro={d.blurb}
      basePath={`/catalog/${dept}`}
      categoryBase={`/catalog/${dept}`}
      searchParams={flat}
      aside={
        <nav aria-label="Categories" className="no-scrollbar mb-8 -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          {d.categories.slice(0, 18).map((c) => (
            <Link
              key={c.slug}
              href={`/catalog/${dept}/${c.slug}`}
              className="shrink-0 rounded-full border border-line-2 bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {c.label}
              <span className="ml-1.5 font-mono text-[10.5px] text-slate-soft">{c.count}</span>
            </Link>
          ))}
        </nav>
      }
    />
  );
}
