import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { brands, catalogIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Our brands",
  description: "Amit Electricals is an authorised distributor for Surya, Polycab, Halonix and Indo.",
};

export default function BrandsPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Brands" }]} />
      <header className="max-w-2xl">
        <p className="eyebrow">Authorised distributor</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">The brands we carry</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Four principals, one counter. Every product on this site ships under the brand&apos;s own
          warranty and support — we just make it one enquiry instead of four.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {brands.map((b) => {
          const count = catalogIndex.filter((r) => r.b === b.label).length;
          const isOwn = b.slug === "rexsun";
          return (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="group card flex flex-col p-6 transition-shadow hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-display text-[26px] font-extrabold tracking-[-0.02em] transition-colors group-hover:text-copper">
                  {b.label}
                </span>
                {isOwn ? (
                  <span className="rounded bg-volt/25 px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">
                    Own label
                  </span>
                ) : (
                  <span className="font-mono text-[12px] text-slate-soft">{count} products</span>
                )}
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-3">{b.note}</p>
              <span className="mt-5 text-[13px] font-semibold text-copper">
                {isOwn ? "Learn more" : `Browse ${b.label}`} →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
