import Link from "next/link";
import Image from "next/image";
import HeroBanners from "@/components/HeroBanners";
import OrderPad from "@/components/OrderPad";
import ProductRail, { type Rail } from "@/components/ProductRail";
import SectionHead from "@/components/SectionHead";
import DeptIcon from "@/components/DeptIcon";
import { brands, catalogIndex, departments } from "@/lib/catalog";
import { db } from "@/lib/db";
import { getFaqs, getGiftBands } from "@/lib/content";

// Banners, gift bands and FAQ all come from the database and are editable
// live from the admin — this page has to be rendered per-request, not
// prerendered once at build time (when there's no database to read from
// anyway, since the build step never has a live connection).
export const dynamic = "force-dynamic";

/** Official brand marks, used with permission as their authorised distributor. */
const BRAND_LOGOS: Record<string, string> = {
  polycab: "/brands/polycab.png",
  surya: "/brands/surya.svg",
  halonix: "/brands/halonix.png",
  indo: "/brands/indo.svg",
};

/**
 * Department banner gradients — each pair drawn from the site's own token
 * set (copper, volt, ink, ok) rather than new hues, so the "colourful"
 * section still reads as one palette rather than seven random ones.
 */
const DEPT_BANNER: Record<string, [string, string]> = {
  "wires-cables": ["#b26a38", "#d98a4e"], // copper -> copper-2: bronze wire
  lighting: ["#d98a4e", "#f2c230"], // copper-2 -> volt: warm glow
  fans: ["#2c4257", "#16283b"], // ink-3 -> ink-2: cool breeze
  switches: ["#0b1622", "#b26a38"], // ink -> copper: dark to bronze
  switchgear: ["#16283b", "#0b1622"], // ink-2 -> ink: deep navy
  appliances: ["#b26a38", "#f2c230"], // copper -> volt: kitchen warmth
  solar: ["#17825b", "#f2c230"], // ok -> volt: green energy
  fallback: ["#2c4257", "#0b1622"],
};

const SEGMENTS = [
  {
    title: "Electrical contractors",
    copy: "Site-wise lists, repeat kits and indent visibility so you can quote a job before you win it.",
    points: ["Separate list per site", "Reorder a past list in one tap", "Box-quantity aware"],
    href: "/order-pad",
    cta: "Start a site list",
  },
  {
    title: "Retailers & sub-dealers",
    copy: "Counter-stock replenishment across four brands in one enquiry instead of four phone calls.",
    points: ["Cross-brand basket", "Catalogue-code ordering", "Same-day proforma"],
    href: "/catalog",
    cta: "Browse the catalogue",
  },
  {
    title: "Builders & project teams",
    copy: "Schedule-of-quantity supply for towers, plots and fit-outs, matched to spec sheets.",
    points: ["Bulk CSV upload", "Spec-level comparison", "Staged delivery planning"],
    href: "/bulk-upload",
    cta: "Upload a schedule",
  },
  {
    title: "Corporates & HR teams",
    copy: "Diwali and milestone gifting from appliance ranges employees actually keep using.",
    points: ["Budget-band curation", "Logo & co-branding", "Multi-address dispatch"],
    href: "/corporate-gifting",
    cta: "Plan a gifting round",
  },
];

const STEPS = [
  { n: "01", t: "Build a list", d: "Browse, search, use the order pad, or upload a spreadsheet. Add across brands into one list." },
  { n: "02", t: "Send it over", d: "Submit the list as an enquiry with your firm details, site name and delivery window." },
  { n: "03", t: "Get a proforma", d: "Our counter prices every line against your rate contract and sends a proforma the same working day." },
  { n: "04", t: "Confirm & dispatch", d: "Approve the proforma and we pack, invoice and dispatch. Payment is settled offline, as always." },
];

const BANNER_NOTES: Record<number, string> = {
  1: "Primary campaign",
  2: "Brand or season",
  3: "Offer or new range",
};

export default async function HomePage() {
  const [bannerRows, deptBannerRows, FAQ, giftBands] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { slot: "asc" } }),
    db.deptBanner.findMany({ where: { active: true } }),
    getFaqs(),
    getGiftBands(),
  ]);
  const GIFT_BANDS = giftBands.map((b) => ({ id: b.id, band: b.range, pick: b.note }));
  const bannerSlots = [1, 2, 3].map((slot) => {
    const row = bannerRows.find((b) => b.slot === slot);
    return { id: slot, note: BANNER_NOTES[slot], image: row?.image || undefined, link: row?.link };
  });
  const deptBannerBySlug = new Map(deptBannerRows.map((r) => [r.slug, r.image]));

  const rails: Rail[] = departments
    .filter((d) => d.count >= 40)
    .slice(0, 6)
    .map((d) => ({
      key: d.slug,
      label: d.label,
      href: `/catalog/${d.slug}`,
      // Prefer lines with a wattage or variant table — they read as real SKUs.
      rows: catalogIndex
        .filter((r) => r.d === d.slug)
        .sort((a, b) => (b.v || 0) - (a.v || 0) || a.n.length - b.n.length)
        .slice(0, 10),
    }));

  return (
    <>
      {/* ---------------- Hero: carousel + category rail ---------------- */}
      <section className="border-b border-line bg-mist">
        <div className="shell py-8 lg:py-10">
          <div className="rise relative">
            <HeroBanners slots={bannerSlots} />

            {/* Department rail, overlapping the carousel's bottom edge */}
            <nav
              aria-label="Shop by department"
              className="no-scrollbar relative z-10 -mt-6 flex gap-1 overflow-x-auto rounded-card border border-line bg-paper p-1.5 shadow-pop sm:-mt-7 sm:gap-1.5 sm:p-2"
            >
              {departments.map((d) => (
                <Link
                  key={d.slug}
                  href={`/catalog/${d.slug}`}
                  className="group flex shrink-0 flex-col items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-center transition-colors hover:bg-mist sm:flex-1"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-mist text-ink-3 transition-colors group-hover:bg-ink group-hover:text-volt">
                    <DeptIcon slug={d.slug} className="size-4" />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold text-ink-2">
                    {d.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* ---------------- Brand strip ---------------- */}
      <section className="border-b border-line bg-mist">
        <div className="shell py-10 sm:py-12">
          <div className="mb-5 flex items-baseline justify-between gap-3 sm:mb-6">
            <div>
              <p className="eyebrow">Authorised distributor for</p>
              <h2 className="mt-1.5 text-[19px] sm:text-[22px] lg:text-[26px]">
                Genuine stock, four principals
              </h2>
            </div>
            <Link
              href="/brands"
              className="shrink-0 text-[12.5px] font-semibold text-copper hover:underline sm:text-[13px]"
            >
              All brands →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
            {brands.map((b) => {
              const count = catalogIndex.filter((r) => r.b === b.label).length;
              const logo = BRAND_LOGOS[b.slug];
              return (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="group card flex flex-col overflow-hidden bg-paper transition-shadow hover:shadow-lift"
                >
                  <span className="flex h-14 items-center justify-center border-b border-line px-4 sm:h-20 sm:px-6">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={b.label}
                        className="max-h-6 max-w-full object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-8"
                      />
                    ) : (
                      <span className="font-display text-[15px] font-extrabold tracking-[-0.02em] text-ink-3 sm:text-[20px]">
                        {b.label}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-1 flex-col p-2.5 sm:p-3.5">
                    <span className="flex items-center justify-between gap-2">
                      {b.slug === "rexsun" ? (
                        <span className="rounded bg-volt/25 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.08em] uppercase text-ink-2 sm:text-[9.5px]">
                          Own label
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-soft sm:text-[11px]">
                          {count} products
                        </span>
                      )}
                      <span className="hidden text-[11px] font-semibold text-copper transition-opacity sm:inline sm:opacity-0 sm:group-hover:opacity-100">
                        Shop →
                      </span>
                    </span>
                    <span className="mt-1 hidden text-[11.5px] leading-relaxed text-slate-soft sm:mt-1.5 sm:block">
                      {b.note}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Departments ---------------- */}
      <section className="shell py-11 sm:py-16">
        <SectionHead
          eyebrow="Shop by department"
          title="Everything an electrical job needs, sorted the way you buy it"
          copy="Not by brand — by what you are actually looking for. Filter down to wattage, sweep size, current rating or core size inside every department."
          href="/catalog"
          hrefLabel="Full catalogue"
        />

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {departments.map((d, i) => {
            const [from, to] = DEPT_BANNER[d.slug] ?? DEPT_BANNER.fallback;
            const photo = deptBannerBySlug.get(d.slug);
            const featured = i === 0;
            return (
              <Link
                key={d.slug}
                href={`/catalog/${d.slug}`}
                style={
                  photo
                    ? undefined
                    : {
                        // A dark wash over the department gradient keeps white text
                        // legible no matter how bright the pair (e.g. gold/volt) runs.
                        backgroundImage: `linear-gradient(165deg, rgba(11,22,34,.1), rgba(11,22,34,.72)), linear-gradient(135deg, ${from}, ${to})`,
                      }
                }
                className={`group relative isolate flex min-h-[132px] flex-col overflow-hidden rounded-card bg-mist-2 p-3.5 shadow-lift transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[168px] sm:p-5 ${
                  featured ? "col-span-2" : ""
                }`}
              >
                {photo ? (
                  // Admin has uploaded artwork for this tile — the photo carries
                  // its own text and branding, exactly like the hero banners, so
                  // nothing from the placeholder below renders alongside it.
                  <Image
                    src={photo}
                    alt={d.label}
                    fill
                    sizes={featured ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 310px, 50vw"}
                    className="object-cover"
                  />
                ) : (
                  <>
                    <DeptIcon
                      slug={d.slug}
                      className="pointer-events-none absolute -right-3 -top-3 size-20 text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:-right-4 sm:-top-4 sm:size-32"
                    />

                    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm sm:size-10">
                      <DeptIcon slug={d.slug} className="size-4 text-white sm:size-5" />
                    </span>

                    <span className="relative mt-auto pt-5 sm:pt-8">
                      <span className="flex items-baseline gap-1.5 sm:gap-2">
                        <span className="font-display text-[14.5px] font-bold tracking-[-0.02em] text-white sm:text-[18px]">
                          {d.label}
                        </span>
                        <span className="font-mono text-[10px] text-white/60 sm:text-[11px]">
                          {d.count}
                        </span>
                      </span>
                      <span className="mt-1 line-clamp-2 max-w-[30ch] text-[11px] leading-relaxed text-white/75 sm:mt-1.5 sm:text-[12.5px]">
                        {d.blurb}
                      </span>
                      <span className="mt-2.5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-white sm:mt-4 sm:text-[11.5px]">
                        Shop {d.label.toLowerCase()}
                        <svg
                          viewBox="0 0 24 24"
                          className="size-3 transition-transform group-hover:translate-x-0.5 sm:size-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Order pad, live ---------------- */}
      <section className="border-y border-line bg-ink text-white">
        <div className="shell grid gap-10 py-11 sm:gap-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-volt">
              The reason to use this site
            </p>
            <h2 className="mt-3 text-[24px] text-white sm:mt-4 sm:text-[30px] lg:text-[38px]">
              Nobody orders 40 items by clicking 40 product pages.
            </h2>
            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-white/70 sm:mt-5 sm:text-[15px]">
              So we built the order pad instead. Type a catalogue code or three words, hit Enter,
              type the next one. Forty lines take about two minutes. Paste a list straight out of
              WhatsApp or a spreadsheet and we will match it to the catalogue for you.
            </p>

            <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
              {[
                ["Code or name", "FPENSST038P or “aery pedestal fan” — both land on the same SKU."],
                ["Paste a block", "One item per line with a quantity. We match, you confirm."],
                ["Keyboard only", "Enter accepts the top suggestion and jumps to the next row."],
                ["Several lists at once", "One per site or project, so nothing gets mixed up."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-volt/20 text-volt">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <span className="text-[14px] font-semibold text-white">{t}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-white/60">{d}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-2.5">
              <Link href="/order-pad" className="btn bg-volt text-ink hover:bg-white">
                Open the full order pad
              </Link>
              <Link
                href="/bulk-upload"
                className="btn border border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Upload a spreadsheet
              </Link>
            </div>
          </div>

          <div className="rounded-card border border-white/12 bg-paper p-1 shadow-pop">
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-slate-soft">
                Try it — it is live
              </p>
              <span className="flex gap-1">
                <span className="size-2 rounded-full bg-line-2" />
                <span className="size-2 rounded-full bg-line-2" />
                <span className="size-2 rounded-full bg-copper" />
              </span>
            </div>
            <div className="overflow-hidden rounded-[10px] border border-line">
              <OrderPad initialRows={4} compact />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Product rails ---------------- */}
      <section className="shell py-11 sm:py-16">
        <SectionHead
          eyebrow="Moving fast this month"
          title="What the trade is picking up"
          copy="A slice of each department. Add straight to your enquiry list from here — quantities step in tens because that is how the counter sells."
        />
        <ProductRail rails={rails} />
      </section>

      {/* ---------------- Ways to order ---------------- */}
      <section className="border-y border-line bg-mist">
        <div className="shell py-11 sm:py-16">
          <SectionHead
            eyebrow="Four ways in"
            title="Order however suits the day"
            copy="Some jobs start from a spec sheet, some from a phone call at the site gate. All four routes end in the same place."
          />
          <div className="grid gap-3 lg:grid-cols-4">
            {[
              {
                t: "Order pad",
                d: "Type or paste codes. Fastest for a known list.",
                href: "/order-pad",
                icon: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
              },
              {
                t: "Bulk upload",
                d: "Drop a CSV or Excel schedule of quantities.",
                href: "/bulk-upload",
                icon: "M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
              },
              {
                t: "Browse & filter",
                d: "Narrow by wattage, sweep, rating or core size.",
                href: "/catalog",
                icon: "M4 6h16M7 12h10M10 18h4",
              },
              {
                t: "Call the counter",
                d: "Mon–Sat, 9:30am to 7:30pm. We know the stock.",
                href: "tel:+919915033360",
                icon: "M4 5c0 8.3 6.7 15 15 15v-3.2l-4-1.6-2 2a13 13 0 0 1-6.2-6.2l2-2L7.2 5H4Z",
              },
            ].map((w) => (
              <Link
                key={w.t}
                href={w.href}
                className="group card flex flex-col p-5 transition-shadow hover:shadow-lift"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-ink text-volt transition-colors group-hover:bg-copper group-hover:text-white">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d={w.icon} />
                  </svg>
                </span>
                <span className="mt-4 font-display text-[16px] font-bold tracking-[-0.02em]">{w.t}</span>
                <span className="mt-1.5 text-[13px] leading-relaxed text-slate-soft">{w.d}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Compare across brands ---------------- */}
      <section className="shell py-11 sm:py-16">
        <div className="card grid overflow-hidden lg:grid-cols-[1fr_0.85fr]">
          <div className="p-5 sm:p-8 lg:p-12">
            <p className="eyebrow">Cross-brand comparison</p>
            <h2 className="mt-3 text-[20px] sm:text-[26px] lg:text-[32px]">
              Four brands, one spec sheet, side by side.
            </h2>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-ink-3 sm:mt-4 sm:text-[14.5px]">
              A 1200mm BLDC fan from Surya, Polycab and Halonix are not the same fan. Put up to four
              products in the compare tray and read air delivery, wattage, sweep, warranty and box
              quantity in one table — then add the winner to your list without leaving the page.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7">
              <Link href="/catalog/fans" className="btn btn-ink">
                Compare ceiling fans
              </Link>
              <Link href="/catalog/lighting" className="btn btn-line">
                Compare LED lighting
              </Link>
            </div>
          </div>

          <div className="border-t border-line bg-mist p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <p className="eyebrow">What you get in the table</p>
            <ul className="mt-4 divide-y divide-line">
              {[
                ["Wattage & air delivery", "Compare real output, not marketing copy"],
                ["Sweep & dimensions", "Fits the space you actually have"],
                ["Warranty", "Varies more between brands than buyers expect"],
                ["Box quantity", "So the order maths works at the counter"],
                ["Stock signal", "In stock today, or on indent with a lead time"],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3 py-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" />
                  <span>
                    <span className="block text-[13.5px] font-semibold">{t}</span>
                    <span className="block text-[12.5px] text-slate-soft">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- Corporate & gifting ---------------- */}
      <section className="border-y border-line bg-copper-soft">
        <div className="shell grid gap-10 py-11 sm:gap-12 sm:py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-copper">
              Corporate & employee gifting
            </p>
            <h2 className="mt-3 text-[24px] sm:mt-4 sm:text-[30px] lg:text-[38px]">
              Gifts your team keeps plugged in all year.
            </h2>
            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-ink-3 sm:mt-5 sm:text-[15px]">
              Diwali rounds, milestone rewards, channel-partner gifting and site-worker welfare kits
              — built from appliance and fan ranges people genuinely use, not novelty items that go
              in a cupboard. Pick a budget band, we curate the options and handle multi-address
              dispatch.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7">
              <Link href="/corporate-gifting" className="btn btn-copper">
                Plan a gifting round
              </Link>
              <Link href="/contact" className="btn btn-line">
                Talk to the gifting desk
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {GIFT_BANDS.map((g) => (
              <Link
                key={g.id}
                href="/corporate-gifting"
                className="card group p-5 transition-shadow hover:shadow-lift"
              >
                <p className="font-display text-[18px] font-bold tracking-[-0.02em] transition-colors group-hover:text-copper">
                  {g.band}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-soft">{g.pick}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Segments ---------------- */}
      <section className="shell py-11 sm:py-16">
        <SectionHead
          eyebrow="Built for how you buy"
          title="Whether you are wiring one flat or forty floors"
          copy="The catalogue is the same. What changes is the tooling around it."
        />
        <div className="grid gap-3 lg:grid-cols-2">
          {SEGMENTS.map((s) => (
            <div key={s.title} className="card flex flex-col p-5 sm:p-6 lg:p-7">
              <h3 className="text-[19px]">{s.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-3">{s.copy}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {s.points.map((p) => (
                  <li
                    key={p}
                    className="rounded-full border border-line bg-mist px-2.5 py-1 text-[11.5px] text-ink-3"
                  >
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={s.href} className="btn btn-sm btn-line mt-6 self-start">
                {s.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="border-y border-line bg-mist">
        <div className="shell py-11 sm:py-16">
          <SectionHead
            eyebrow="How ordering works"
            title="List in, proforma out, no payment on the site"
            copy="You will never be asked to pay here. The platform exists to get an accurate list to the counter and an accurate quote back to you."
          />
          <ol className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="card relative overflow-hidden p-3.5 sm:p-6">
                <span className="font-mono text-[10.5px] tracking-[0.14em] text-copper sm:text-[11px]">
                  {s.n}
                </span>
                <h3 className="mt-2 text-[14px] sm:mt-3 sm:text-[17px]">{s.t}</h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-soft sm:mt-2 sm:text-[13px]">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="shell py-11 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Straight answers</p>
            <h2 className="mt-3 text-[21px] sm:text-[26px] lg:text-[32px]">
              Questions we get at the counter
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-3">
              Still unsure about something?{" "}
              <Link href="/contact" className="font-semibold text-copper hover:underline">
                Ask us directly
              </Link>{" "}
              — a person answers.
            </p>
          </div>
          <div className="divide-y divide-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="text-[15px] font-semibold">{f.q}</span>
                  <span className="mt-1 shrink-0 text-slate-soft transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Closing CTA ---------------- */}
      <section className="shell pb-4">
        <div className="relative overflow-hidden rounded-card bg-ink px-5 py-11 text-center text-white sm:px-8 sm:py-14 lg:px-16 lg:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 14px)",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-[24px] text-white sm:text-[30px] lg:text-[40px]">
              Put your next list together in two minutes.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-white/70 sm:mt-4 sm:text-[15px]">
              No account, no card, no minimum to get a quote. Build the list, send it, and we will
              come back with rates that apply to your firm.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:mt-8">
              <Link href="/order-pad" className="btn bg-volt text-ink hover:bg-white">
                Open the order pad
              </Link>
              <Link
                href="/catalog"
                className="btn border border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                Browse the catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
