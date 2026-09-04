"use client";

/**
 * Ordering panel on a product page.
 *
 * Brands publish their ranges as variant tables (wattage, size, colour), and
 * those rows are what the counter actually picks from — so the panel makes the
 * variant a first-class choice and lets the buyer order in boxes when the brand
 * tells us the box quantity.
 */

import { useState } from "react";
import Link from "next/link";
import { useBasket } from "./BasketProvider";
import type { Product } from "@/lib/types";

export default function ProductOrderPanel({ product }: { product: Product }) {
  const { add, ready, active } = useBasket();
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(10);
  const [uom, setUom] = useState<"pcs" | "box">("pcs");
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const variant = product.variants[vi] ?? null;
  const boxQty = variant?.boxQty ?? null;
  const step = uom === "box" ? 1 : 10;
  const pieces = uom === "box" && boxQty ? qty * boxQty : qty;

  const commit = () => {
    add({
      code: product.code,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      variant: variant?.label ?? null,
      qty,
      uom,
      boxQty,
      note: note.trim(),
      image: product.localImages[0] || "",
    });
    setAdded(true);
    setNote("");
    setNoteOpen(false);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="card p-5 lg:p-6">
      {product.variants.length > 1 && (
        <div className="mb-5">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="eyebrow">Choose a variant</p>
            <p className="font-mono text-[10.5px] text-slate-soft">
              {product.variants.length} options
            </p>
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {product.variants.map((v, i) => (
              <button
                key={`${v.label}-${i}`}
                type="button"
                onClick={() => setVi(i)}
                aria-pressed={i === vi}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                  i === vi ? "border-ink bg-ink text-paper" : "border-line hover:border-ink-3"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">{v.label}</span>
                  <span
                    className={`mt-0.5 block truncate text-[11.5px] ${
                      i === vi ? "text-paper/60" : "text-slate-soft"
                    }`}
                  >
                    {Object.entries(v.attrs)
                      .slice(1, 4)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(" · ") || product.category}
                  </span>
                </span>
                {v.boxQty && (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ${
                      i === vi ? "bg-white/15 text-paper" : "bg-mist text-ink-3"
                    }`}
                  >
                    box {v.boxQty}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {boxQty && (
        <div className="mb-4 flex rounded-lg border border-line bg-mist p-0.5">
          {(["pcs", "box"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => {
                setUom(u);
                setQty(u === "box" ? 1 : 10);
              }}
              aria-pressed={uom === u}
              className={`flex-1 rounded-md py-1.5 text-[12.5px] font-semibold transition-colors ${
                uom === u ? "bg-paper text-ink shadow-sm" : "text-slate-soft hover:text-ink"
              }`}
            >
              {u === "pcs" ? "By pieces" : `By box (${boxQty})`}
            </button>
          ))}
        </div>
      )}

      <label className="eyebrow" htmlFor="pdp-qty">
        Quantity
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-line-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - step))}
            aria-label="Decrease quantity"
            className="w-10 shrink-0 text-[17px] leading-none text-slate-soft transition-colors hover:bg-mist hover:text-ink"
          >
            −
          </button>
          <input
            id="pdp-qty"
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(999999, Number(e.target.value.replace(/\D/g, "")) || 1)))
            }
            inputMode="numeric"
            className="w-16 min-w-0 flex-1 border-x border-line bg-transparent text-center font-mono text-[14px] outline-none sm:w-16 sm:flex-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(999999, q + step))}
            aria-label="Increase quantity"
            className="w-10 shrink-0 text-[17px] leading-none text-slate-soft transition-colors hover:bg-mist hover:text-ink"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={commit}
          disabled={!ready}
          className={`btn h-11 w-full sm:flex-1 ${added ? "btn-copper" : "btn-ink"}`}
        >
          {added ? "Added to list" : "Add to enquiry list"}
        </button>
      </div>

      <p className="mt-2 text-[12px] text-slate-soft">
        {uom === "box" && boxQty
          ? `${qty} box${qty > 1 ? "es" : ""} = ${pieces.toLocaleString("en-IN")} pieces`
          : "Quantity steps in tens — type any number to override."}
      </p>

      {!noteOpen ? (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="mt-3 text-[12.5px] font-semibold text-copper hover:underline"
        >
          + Add a note for this line
        </button>
      ) : (
        <div className="mt-3">
          <label htmlFor="pdp-note" className="eyebrow">
            Line note
          </label>
          <input
            id="pdp-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. 4000K only, or for Tower B second floor"
            className="field mt-1.5 h-10 text-[13px]"
          />
        </div>
      )}

      {added && (
        <p className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-ok-soft px-3 py-2.5 text-[12.5px] font-medium text-ok">
          <span>Added to “{active.name}”.</span>
          <Link href="/enquiry" className="shrink-0 font-semibold underline">
            Review →
          </Link>
        </p>
      )}

      <div className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px] text-slate-soft">
        <p className="flex items-start gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" />
          Rates are quoted on enquiry against your firm&apos;s rate contract — nothing is charged here.
        </p>
        <p className="flex items-start gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" />
          {product.stock === "indent"
            ? "This line is on indent. We quote it with a lead time."
            : "Stocked line — usually dispatched within 24 hours of confirmation."}
        </p>
      </div>
    </div>
  );
}
