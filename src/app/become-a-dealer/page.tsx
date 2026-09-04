import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Become a dealer",
  description: "Set up a rate-contract account with Amit Electricals for Surya, Polycab, Halonix and Indo.",
};

const TIERS = [
  {
    t: "Retailer",
    d: "Counter-stock replenishment for a single shop.",
    points: ["Standard trade rates", "Order pad access", "Same-day proforma"],
  },
  {
    t: "Dealer",
    d: "Regular volume across multiple categories.",
    points: ["Negotiated slab pricing", "Priority indent handling", "Monthly account statement"],
  },
  {
    t: "Project / Contractor",
    d: "Site-wise supply against a schedule of quantities.",
    points: ["Bulk upload & staged dispatch", "Site-wise enquiry lists", "Credit terms on review"],
  },
];

const STEPS = [
  ["01", "Tell us about your firm", "Share your GSTIN, city and the categories you deal in."],
  ["02", "We set your rate tier", "Based on volume and category, matched against brand price lists."],
  ["03", "You get full access", "Order pad, bulk upload and your tier's rates on every enquiry."],
];

export default function BecomeADealerPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Become a dealer" }]} />

      <header className="max-w-2xl">
        <p className="eyebrow">For retailers, dealers and contractors</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">Set up a trade account</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          A trade account gets you rates matched to your volume, faster proforma turnaround, and
          priority on indent lines. It costs nothing to set up — leave your details and the counter
          will call to confirm your tier.
        </p>
      </header>

      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.t} className="card p-5">
            <h3 className="text-[17px]">{t.t}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">{t.d}</p>
            <ul className="mt-4 space-y-2">
              {t.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-[12.5px] text-ink-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-[22px]">Three steps, no paperwork today</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-volt">
                  {n}
                </span>
                <span>
                  <span className="block text-[14.5px] font-semibold">{t}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-slate-soft">{d}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="card mt-8 p-5">
            <p className="text-[13px] font-semibold">Already know your regular items?</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-soft">
              You don&apos;t need an account to send your first enquiry — build a list on the order
              pad and submit it. We will set up your rate tier alongside it.
            </p>
          </div>
        </div>

        <ContactForm
          topic="dealer"
          messageLabel="Tell us about your business"
          messagePlaceholder="Categories you deal in, approximate monthly volume, current suppliers"
          submitLabel="Request a trade account"
        />
      </div>
    </div>
  );
}
