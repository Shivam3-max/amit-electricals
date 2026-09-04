import Link from "next/link";
import ProductCard from "./ProductCard";
import CatalogFilters from "./CatalogFilters";
import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import { runQuery, type Query } from "@/lib/filter";

/** Page links, condensed around the current page. */
function pageWindow(page: number, pages: number) {
  const out = new Set<number>([1, pages, page]);
  for (let d = 1; d <= 2; d++) {
    if (page - d > 1) out.add(page - d);
    if (page + d < pages) out.add(page + d);
  }
  return [...out].sort((a, b) => a - b);
}

export default function CatalogView({
  query,
  crumbs,
  eyebrow,
  title,
  intro,
  basePath,
  categoryBase,
  searchParams,
  aside,
}: {
  query: Query;
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  intro?: string;
  basePath: string;
  categoryBase?: string;
  searchParams: Record<string, string | undefined>;
  /** Optional block shown under the heading, e.g. category shortcuts. */
  aside?: React.ReactNode;
}) {
  const { rows, total, page, pages, groups } = runQuery(query);

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={crumbs} />

      <header className="mb-7 max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">{title}</h1>
        {intro && <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">{intro}</p>}
      </header>

      {aside}

      <CatalogFilters groups={groups} total={total} categoryBase={categoryBase}>
        {rows.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <p className="font-display text-[19px] font-bold">Nothing matches those filters.</p>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] text-ink-3">
              Try clearing a filter, or tell us what you are after — if it is a line we can indent,
              we will quote it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href={basePath} className="btn btn-line">
                Clear filters
              </Link>
              <Link href="/contact" className="btn btn-ink">
                Ask the counter
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {rows.map((row) => (
              <ProductCard key={row.c} row={row} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
            {page > 1 && (
              <Link href={href(page - 1)} className="btn btn-sm btn-line" rel="prev">
                ← Prev
              </Link>
            )}
            {pageWindow(page, pages).map((p, i, arr) => (
              <span key={p} className="flex items-center gap-1.5">
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-1 text-slate-soft" aria-hidden="true">
                    …
                  </span>
                )}
                <Link
                  href={href(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 font-mono text-[12.5px] transition-colors ${
                    p === page
                      ? "border-ink bg-ink text-paper"
                      : "border-line-2 text-ink-2 hover:border-ink-3"
                  }`}
                >
                  {p}
                </Link>
              </span>
            ))}
            {page < pages && (
              <Link href={href(page + 1)} className="btn btn-sm btn-line" rel="next">
                Next →
              </Link>
            )}
          </nav>
        )}

        <div className="mt-12 rounded-card border border-line bg-mist px-6 py-7 text-center">
          <p className="font-display text-[17px] font-bold">Ordering more than a handful?</p>
          <p className="mx-auto mt-1.5 max-w-lg text-[13.5px] text-ink-3">
            Skip the grid. The order pad takes catalogue codes straight from your list, and bulk
            upload reads a spreadsheet.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link href="/order-pad" className="btn btn-sm btn-ink">
              Open the order pad
            </Link>
            <Link href="/bulk-upload" className="btn btn-sm btn-line">
              Upload a list
            </Link>
          </div>
        </div>
      </CatalogFilters>
    </div>
  );
}
