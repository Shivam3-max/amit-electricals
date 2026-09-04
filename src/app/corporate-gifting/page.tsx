import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import { catalogIndex } from "@/lib/catalog";
import { getGiftBands } from "@/lib/content";

export const metadata: Metadata = {
  title: "Corporate & employee gifting",
  description:
    "Diwali rounds, milestone rewards and dealer gifting curated from Surya, Polycab, Halonix and Indo appliance ranges — budget-banded, with logo and multi-address dispatch.",
};

const OCCASIONS = [
  ["Diwali & festival rounds", "The single biggest gifting event of the year, planned and dispatched on a schedule you set."],
  ["Work anniversaries & milestones", "Individually addressed, ordered as they come up rather than in one large batch."],
  ["Onboarding kits", "A consistent welcome kit for every new joiner, held on standing reorder."],
  ["Channel partner & dealer gifting", "Co-branded where the brand allows it, dispatched to multiple partner addresses."],
];

const STEPS = [
  ["01", "Pick a budget band", "Or tell us a number and we shortlist across all four brands."],
  ["02", "Confirm quantity & addresses", "One bulk delivery, or split across offices — either works."],
  ["03", "Add logo where possible", "Co-branding depends on the item; we confirm what's feasible before you commit."],
  ["04", "We dispatch on your date", "Timed for the event, not for our convenience."],
];

export default async function CorporateGiftingPage() {
  const BANDS = await getGiftBands();
  const byCode = new Map(catalogIndex.map((r) => [r.c, r]));

  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Corporate & gifting" }]} />

      <header className="max-w-2xl">
        <p className="eyebrow">Corporate & employee gifting</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">Gifts your team keeps plugged in</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Diwali rounds, milestone rewards, onboarding kits and channel-partner gifting — built from
          appliance and fan ranges people actually use, not novelty items that go in a cupboard. Pick
          a budget band below, or tell us the occasion and we&apos;ll shortlist across all four
          brands.
        </p>
      </header>

      <section className="mt-10">
        <p className="eyebrow mb-4">Occasions we plan for</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OCCASIONS.map(([t, d]) => (
            <div key={t} className="card p-4">
              <p className="text-[13.5px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <p className="eyebrow mb-4">Shop by budget</p>
        <div className="space-y-10">
          {BANDS.map((b) => {
            const rows = b.codes.map((c) => byCode.get(c)).filter((r): r is NonNullable<typeof r> => !!r);
            if (!rows.length) return null;
            return (
              <div key={b.id}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3">
                  <h2 className="text-[19px]">{b.range}</h2>
                  <p className="text-[13px] text-slate-soft">{b.note}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {rows.map((row) => (
                    <ProductCard key={row.c} row={row} showCompare={false} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[13px] text-slate-soft">
          These are starting points — the full{" "}
          <Link href="/catalog/appliances" className="font-semibold text-copper hover:underline">
            appliances
          </Link>{" "}
          and{" "}
          <Link href="/catalog/fans" className="font-semibold text-copper hover:underline">
            fans
          </Link>{" "}
          departments are fair game for a gifting round.
        </p>
      </section>

      <section className="mt-16 border-y border-line bg-mist py-12">
        <div className="grid gap-3 lg:grid-cols-4">
          {STEPS.map(([n, t, d]) => (
            <div key={n} className="card p-5">
              <span className="font-mono text-[11px] tracking-[0.14em] text-copper">{n}</span>
              <p className="mt-2 text-[14.5px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">Already have a shortlist?</p>
          <h2 className="mt-2 text-[22px]">Add it to a list, then talk to us</h2>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-3">
            If you already know what you want, add it straight to an enquiry list from the grid above
            or the order pad, name the list something like &ldquo;Diwali 2026&rdquo;, and mention the
            round and quantity when you submit it.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/order-pad" className="btn btn-ink">
              Open the order pad
            </Link>
            <Link href="/enquiry" className="btn btn-line">
              Review my list
            </Link>
          </div>
        </div>

        <ContactForm
          topic="gifting"
          messageLabel="Tell us about the round"
          messagePlaceholder="Occasion, approximate headcount, budget per head, delivery date"
          submitLabel="Talk to the gifting desk"
        />
      </section>
    </div>
  );
}
