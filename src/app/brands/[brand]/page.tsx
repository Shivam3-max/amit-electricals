import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CatalogView from "@/components/CatalogView";
import Breadcrumbs from "@/components/Breadcrumbs";
import { brands, catalogIndex, departments, getBrand } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const b = getBrand((await params).brand);
  if (!b) return { title: "Not found" };
  return { title: b.label, description: `${b.note} Browse the full ${b.label} range stocked by Amit Electricals.` };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<SP>;
}) {
  const { brand: brandSlug } = await params;
  const b = getBrand(brandSlug);
  if (!b) notFound();

  const rows = catalogIndex.filter((r) => r.b === b.label);

  if (rows.length === 0) {
    // Rexsun — the own label, catalogue pending.
    return (
      <div className="shell py-16">
        <Breadcrumbs items={[{ href: "/brands", label: "Brands" }, { label: b.label }]} />
        <div className="card mx-auto max-w-xl px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-volt/20 text-ink-3">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 3l2.6 5.9 6.4.7-4.8 4.3 1.3 6.3L12 17l-5.5 3.2 1.3-6.3-4.8-4.3 6.4-.7Z" />
            </svg>
          </span>
          <h1 className="mt-4 text-[24px]">{b.label} — our own label</h1>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-3">
            {b.note} We&apos;re finalising the {b.label} range before listing it here. In the
            meantime, our other four brands cover every department on this site.
          </p>
          <Link href="/brands" className="btn btn-ink mt-6">
            Back to brands
          </Link>
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const flat = {
    dept: one(sp.dept),
    cat: one(sp.cat),
    stock: one(sp.stock),
    sort: one(sp.sort),
    page: one(sp.page),
  };

  const deptCounts = departments
    .map((d) => ({ ...d, brandCount: rows.filter((r) => r.d === d.slug).length }))
    .filter((d) => d.brandCount > 0)
    .sort((a, b2) => b2.brandCount - a.brandCount);

  return (
    <CatalogView
      query={{ ...flat, brand: b.label, page: Number(flat.page) || 1 }}
      crumbs={[{ href: "/brands", label: "Brands" }, { label: b.label }]}
      eyebrow={`${rows.length} products`}
      title={b.label}
      intro={b.note}
      basePath={`/brands/${b.slug}`}
      searchParams={flat}
      aside={
        <nav
          aria-label="Departments"
          className="no-scrollbar mb-8 -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
        >
          {deptCounts.map((d) => (
            <Link
              key={d.slug}
              href={`/catalog/${d.slug}?brand=${encodeURIComponent(b.label)}`}
              className="shrink-0 rounded-full border border-line-2 bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
            >
              {d.label}
              <span className="ml-1.5 font-mono text-[10.5px] text-slate-soft">{d.brandCount}</span>
            </Link>
          ))}
        </nav>
      }
    />
  );
}
