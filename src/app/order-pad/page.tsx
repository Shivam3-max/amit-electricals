import type { Metadata } from "next";
import Link from "next/link";
import OrderPad from "@/components/OrderPad";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Order pad",
  description:
    "Type or paste catalogue codes to build a bulk enquiry across Surya, Polycab, Halonix and Indo in minutes.",
};

export default function OrderPadPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Order pad" }]} />

      <header className="max-w-2xl">
        <p className="eyebrow">Fastest way to order</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">The order pad</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Type a catalogue code or a few words of the product name, pick the match, set a quantity,
          and move to the next line — all without leaving the keyboard. Already have a list on a
          spreadsheet or in a WhatsApp message? Paste it in and we will match every line to the
          catalogue for you.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Type or paste", "A code like FPENSST038P, or a name like “20W LED batten”."],
          ["2", "Confirm the match", "Press Enter to accept the top suggestion, or pick from the list."],
          ["3", "Add to your list", "Everything matched goes into your active enquiry list at once."],
        ].map(([n, t, d]) => (
          <div key={n} className="card p-4">
            <span className="font-mono text-[11px] text-copper">{n}</span>
            <p className="mt-1.5 text-[13.5px] font-semibold">{t}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-soft">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <OrderPad initialRows={14} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-card border border-line bg-mist px-5 py-4">
        <p className="text-[13px] text-ink-3">
          Have a full schedule of quantities in Excel instead of a short list?
        </p>
        <Link href="/bulk-upload" className="btn btn-sm btn-line ml-auto">
          Use bulk upload instead
        </Link>
      </div>
    </div>
  );
}
