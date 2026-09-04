import Link from "next/link";
import Logo from "./Logo";
import { brands, stats } from "@/lib/catalog";
import type { Department } from "@/lib/types";

const COMPANY = [
  { href: "/about", label: "About Amit Electricals" },
  { href: "/brands", label: "Our brands" },
  { href: "/become-a-dealer", label: "Become a dealer" },
  { href: "/corporate-gifting", label: "Corporate & gifting" },
  { href: "/contact", label: "Contact & counter hours" },
];

const TOOLS = [
  { href: "/order-pad", label: "Order pad" },
  { href: "/bulk-upload", label: "Bulk upload" },
  { href: "/compare", label: "Compare products" },
  { href: "/enquiry", label: "My enquiry lists" },
  { href: "/catalog", label: "Full catalogue" },
];

export default function Footer({ departments }: { departments: Department[] }) {
  return (
    <footer className="mt-24 border-t border-line bg-ink text-white/70">
      <div className="shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo onDark />
          <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed">
            A single counter for the brands a contractor actually specifies. Browse{" "}
            {stats.products.toLocaleString("en-IN")} products, build a list across brands, and get a
            proforma back the same working day.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            {[
              ["Products", stats.products.toLocaleString("en-IN")],
              ["Categories", String(stats.categories)],
              ["Brands", String(stats.brands)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] tracking-[0.14em] uppercase text-white/40">{k}</dt>
                <dd className="mt-1 font-display text-[19px] font-bold text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav>
          <h4 className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/45">
            Shop by department
          </h4>
          <ul className="mt-4 space-y-2 text-[13.5px]">
            {departments.map((d) => (
              <li key={d.slug}>
                <Link href={`/catalog/${d.slug}`} className="transition-colors hover:text-white">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h4 className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/45">
            Ordering tools
          </h4>
          <ul className="mt-4 space-y-2 text-[13.5px]">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="transition-colors hover:text-white">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="mt-7 font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/45">
            Brands
          </h4>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[13.5px]">
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={`/brands/${b.slug}`} className="transition-colors hover:text-white">
                  {b.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h4 className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/45">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-[13.5px]">
            {COMPANY.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="transition-colors hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>

          <address className="mt-7 space-y-1 text-[13.5px] not-italic">
            <p className="font-semibold text-white">Counter</p>
            <p>Mon–Sat, 9:30am – 7:30pm</p>
            <p>
              <a href="tel:+919915033360" className="transition-colors hover:text-white">
                +91 99150 33360
              </a>
            </p>
            <p>
              <a href="mailto:orders@amitelectricals.in" className="transition-colors hover:text-white">
                orders@amitelectricals.in
              </a>
            </p>
          </address>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-5 text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Amit Electricals. All rights reserved.</p>
          <p className="text-white/45">
            Prices are quoted on enquiry. Brand names and marks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
