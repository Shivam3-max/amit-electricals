import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { brands, stats } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About us",
  description: "Amit Electricals is an authorised distributor for Surya, Polycab, Halonix and Indo.",
};

const VALUES = [
  ["Genuine stock only", "Every line ships under the brand's own warranty. We carry what we're authorised to carry."],
  ["One counter, four brands", "You place one enquiry. We split it across principals and pack it as one dispatch where we can."],
  ["Rates that reflect volume", "A retailer, a dealer and a contractor don't pay the same rate — and shouldn't."],
  ["A person on the other end", "The platform gets the list right. A person still prices it and picks up the phone."],
];

export default function AboutPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "About us" }]} />

      <header className="max-w-2xl">
        <p className="eyebrow">Since day one, one counter</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">About Amit Electricals</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Amit Electricals is an authorised distributor for Surya, Polycab, Halonix and Indo — wires,
          lighting, fans, switchgear and appliances, sold to electrical contractors, retailers,
          dealers and project teams across the region. This site exists so that the ordering side of
          the business is as fast as the counter always has been.
        </p>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-4 border-y border-line py-8 sm:grid-cols-4">
        {[
          ["Products listed", stats.products.toLocaleString("en-IN")],
          ["Brands carried", String(stats.brands)],
          ["Categories", String(stats.categories)],
          ["Same-day proforma", "Standard"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="eyebrow">{k}</dt>
            <dd className="mt-1.5 font-display text-[24px] font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14">
        <p className="eyebrow">What we carry</p>
        <h2 className="mt-2 text-[22px]">Our brand partners</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {brands.map((b) => (
            <Link key={b.slug} href={`/brands/${b.slug}`} className="group card p-4 transition-shadow hover:shadow-lift">
              <p className="font-display text-[17px] font-bold tracking-[-0.02em] transition-colors group-hover:text-copper">
                {b.label}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-soft">{b.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <p className="eyebrow">How we work</p>
        <h2 className="mt-2 text-[22px]">What doesn&apos;t change as we grow</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {VALUES.map(([t, d]) => (
            <div key={t} className="card p-5">
              <p className="text-[14.5px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-card bg-ink px-8 py-12 text-center text-white lg:px-16">
        <h2 className="mx-auto max-w-lg text-[24px] text-white lg:text-[28px]">
          Have a question we haven&apos;t answered here?
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link href="/contact" className="btn bg-volt text-ink hover:bg-white">
            Contact us
          </Link>
          <Link href="/catalog" className="btn border border-white/20 bg-transparent text-white hover:bg-white/10">
            Browse the catalogue
          </Link>
        </div>
      </section>
    </div>
  );
}
