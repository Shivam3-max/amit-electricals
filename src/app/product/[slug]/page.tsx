import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductOrderPanel from "@/components/ProductOrderPanel";
import ProductCard from "@/components/ProductCard";
import CompareToggle from "@/components/CompareToggle";
import AltCompareTable from "@/components/AltCompareTable";
import Breadcrumbs from "@/components/Breadcrumbs";
import { alternatives, catalog, deptLabel, getProduct, related, toIndexRow } from "@/lib/catalog";

export function generateStaticParams() {
  return catalog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.name,
    description: `${p.name} by ${p.brand} — ${p.category}. Catalogue code ${p.code}. ${
      p.description || `Available for bulk enquiry from Amit Electricals, authorised ${p.brand} distributor.`
    }`.slice(0, 300),
    openGraph: { title: `${p.name} · ${p.brand}`, type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  const rel = related(p, 6).map(toIndexRow);
  const alts = alternatives(p, 3);
  const specEntries = Object.entries(p.specs);
  const variantAttrKeys = p.variants.length ? Object.keys(p.variants[0].attrs).slice(1, 4) : [];

  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { href: "/catalog", label: "Catalogue" },
          { href: `/catalog/${p.dept}`, label: deptLabel(p.dept) },
          { href: `/catalog/${p.dept}/${p.categorySlug}`, label: p.category },
          { label: p.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        {/* ---- Media + info (main column) ---- */}
        <div>
          <ProductGallery
            images={p.localImages}
            name={p.name}
            category={p.category}
            overlay={
              <>
                {p.stock === "indent" && (
                  <span className="absolute left-4 top-4 rounded-md bg-ink/85 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.06em] uppercase text-white">
                    On indent
                  </span>
                )}
                <span className="absolute right-4 top-4">
                  <CompareToggle code={p.code} />
                </span>
              </>
            }
          />

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-line-2 bg-mist px-3 py-1 font-mono text-[11px] font-medium text-ink-3">
              {p.code}
            </span>
            <Link
              href={`/brands/${p.brand.toLowerCase()}`}
              className="rounded-full border border-line-2 px-3 py-1 text-[12px] font-semibold transition-colors hover:border-ink-3"
            >
              {p.brand}
            </Link>
            <Link
              href={`/catalog/${p.dept}/${p.categorySlug}`}
              className="rounded-full border border-line-2 px-3 py-1 text-[12px] text-ink-2 transition-colors hover:border-ink-3"
            >
              {p.category}
            </Link>
            {p.series && p.series !== p.category && (
              <span className="rounded-full bg-copper-soft px-3 py-1 text-[12px] font-medium text-copper">
                {p.series} range
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-2xl text-[24px] leading-snug lg:text-[28px]">{p.name}</h1>

          {p.description && (
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-3">{p.description}</p>
          )}

          {/* Order panel sits here on mobile; the sticky rail takes over at lg */}
          <div className="mt-6 max-w-[420px] lg:hidden">
            <ProductOrderPanel product={p} />
          </div>

          {specEntries.length > 0 && (
            <div className="mt-9 max-w-2xl">
              <p className="eyebrow mb-3">Specifications</p>
              <div className="overflow-hidden rounded-card border border-line">
                <table className="w-full text-[13.5px]">
                  <tbody>
                    {specEntries.map(([k, v], i) => (
                      <tr key={k} className={i % 2 ? "bg-mist" : "bg-paper"}>
                        <th className="w-2/5 border-b border-line px-4 py-2.5 text-left font-medium text-ink-3 last:border-b-0">
                          {k}
                        </th>
                        <td className="border-b border-line px-4 py-2.5 text-ink last:border-b-0">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {p.variants.length > 1 && (
            <div className="mt-9 max-w-2xl">
              <p className="eyebrow mb-3">
                Full variant list · {p.variants.length} option{p.variants.length > 1 ? "s" : ""}
              </p>
              <div className="max-h-80 overflow-y-auto rounded-card border border-line">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-mist">
                    <tr>
                      <th className="border-b border-line px-4 py-2 text-left text-ink-3">Variant</th>
                      {variantAttrKeys.map((k) => (
                        <th key={k} className="border-b border-line px-4 py-2 text-left text-ink-3">
                          {k}
                        </th>
                      ))}
                      <th className="border-b border-line px-4 py-2 text-left text-ink-3">Box qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.variants.map((v, i) => (
                      <tr key={`${v.label}-${i}`} className={i % 2 ? "bg-mist/60" : ""}>
                        <td className="border-b border-line px-4 py-2 font-medium">{v.label}</td>
                        {variantAttrKeys.map((k) => (
                          <td key={k} className="border-b border-line px-4 py-2 text-ink-2">
                            {v.attrs[k] ?? "—"}
                          </td>
                        ))}
                        <td className="border-b border-line px-4 py-2 font-mono text-[12px] text-ink-2">
                          {v.boxQty ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <p className="text-[12.5px] font-semibold">Bulk on this item?</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-soft">
                Add straight to the order pad if you already have the code and quantity.
              </p>
              <Link href="/order-pad" className="btn btn-sm btn-line mt-3">
                Open order pad
              </Link>
            </div>
            <div className="card p-4">
              <p className="text-[12.5px] font-semibold">Not sure this is the right fit?</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-soft">
                Tell us the site and use case — we will confirm the spec before you order.
              </p>
              <Link href="/contact" className="btn btn-sm btn-line mt-3">
                Ask the counter
              </Link>
            </div>
          </div>
        </div>

        {/* ---- Sticky order rail (desktop) ---- */}
        <div className="hidden lg:block">
          <div className="sticky top-[196px]">
            <ProductOrderPanel product={p} />
          </div>
        </div>
      </div>

      {alts.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Compare across brands</p>
              <h2 className="mt-2 text-[22px] lg:text-[26px]">Same category, other brands we carry</h2>
            </div>
            <Link
              href="/compare"
              className="hidden shrink-0 text-[13px] font-semibold text-copper hover:underline sm:block"
            >
              Open compare tray →
            </Link>
          </div>
          <div className="card overflow-hidden p-1">
            <AltCompareTable current={p} alts={alts} />
          </div>
        </section>
      )}

      {rel.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <p className="eyebrow">You may also need</p>
          <h2 className="mt-2 text-[22px] lg:text-[26px]">More from {p.category.toLowerCase()}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {rel.map((row) => (
              <ProductCard key={row.c} row={row} showCompare={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
