"use client";

/**
 * Enquiry list — the basket view and the submission form in one page.
 *
 * A buyer may be running several lists (one per site), so the header is a
 * switcher first. The submit step never touches money: it posts the list to
 * /api/enquiry and hands back a reference the counter uses to price it.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { useBasket } from "./BasketProvider";
import { useDealer } from "./DealerProvider";

const PURPOSES = [
  { value: "resale", label: "Resale / retail stock" },
  { value: "project", label: "Project / site supply" },
  { value: "captive", label: "Own use" },
  { value: "gifting", label: "Corporate gifting" },
];

type Confirmed = { ref: string; lineCount: number; units: number };

export default function EnquiryClient() {
  const {
    ready,
    baskets,
    active,
    activeId,
    units,
    setQty,
    setUom,
    setNote,
    remove,
    clear,
    createBasket,
    renameBasket,
    deleteBasket,
    selectBasket,
  } = useBasket();

  const { dealer } = useDealer();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(active.name);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const [form, setForm] = useState({
    company: "",
    contact: "",
    phone: "",
    email: "",
    gstin: "",
    city: "",
    site: "",
    deliverBy: "",
    purpose: "resale",
    notes: "",
  });
  const [prefilled, setPrefilled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // A signed-in dealer's saved details fill the form once, so a repeat order
  // never means retyping the firm's company, GSTIN or phone again. Typing
  // over a field after that is left alone — this only runs the one time.
  useEffect(() => {
    if (!dealer || prefilled) return;
    setForm((f) => ({
      ...f,
      company: f.company || dealer.company,
      contact: f.contact || dealer.contact,
      phone: f.phone || dealer.phone,
      email: f.email || dealer.email || "",
      gstin: f.gstin || dealer.gstin || "",
      city: f.city || dealer.city || "",
    }));
    setPrefilled(true);
  }, [dealer, prefilled]);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          listName: active.name,
          lines: active.lines.map((l) => ({
            code: l.code,
            name: l.name,
            brand: l.brand,
            variant: l.variant,
            qty: l.uom === "box" && l.boxQty ? l.qty * l.boxQty : l.qty,
            uom: l.uom,
            note: l.note,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setConfirmed(data as Confirmed);
    } catch {
      setErrors({ form: "Could not reach the server. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="shell py-16">
        <p className="text-[13.5px] text-slate-soft">Loading your list…</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="shell py-16">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft text-ok">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="mt-5 text-[26px]">Enquiry sent</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
            Reference <span className="code-chip text-ink">{confirmed.ref}</span> · {confirmed.lineCount}{" "}
            line{confirmed.lineCount > 1 ? "s" : ""} · {confirmed.units.toLocaleString("en-IN")} units.
            The counter will price this against your rate contract and call or WhatsApp a proforma,
            usually the same working day.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                clear();
                setConfirmed(null);
              }}
              className="btn btn-ink"
            >
              Start a new list
            </button>
            <Link href="/catalog" className="btn btn-line">
              Keep browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8 lg:py-10">
      <p className="eyebrow">Enquiry list</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {renaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              renameBasket(activeId, nameDraft);
              setRenaming(false);
            }}
            className="flex items-center gap-2"
          >
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                renameBasket(activeId, nameDraft);
                setRenaming(false);
              }}
              className="field h-10 w-56 text-[20px] font-bold"
            />
          </form>
        ) : (
          <h1
            className="cursor-text text-[28px] lg:text-[34px]"
            onClick={() => {
              setNameDraft(active.name);
              setRenaming(true);
            }}
            title="Click to rename this list"
          >
            {active.name}
          </h1>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setSwitcherOpen((v) => !v)}
            className="btn btn-sm btn-line"
          >
            {baskets.length} list{baskets.length > 1 ? "s" : ""}
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {switcherOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-64 overflow-hidden rounded-card border border-line bg-paper shadow-pop">
              <ul className="max-h-64 overflow-y-auto py-1">
                {baskets.map((b) => (
                  <li key={b.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        selectBasket(b.id);
                        setSwitcherOpen(false);
                      }}
                      className={`flex flex-1 items-center justify-between px-3 py-2 text-left text-[13px] transition-colors hover:bg-mist ${
                        b.id === activeId ? "font-semibold text-copper" : "text-ink-2"
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="font-mono text-[10.5px] text-slate-soft">{b.lines.length}</span>
                    </button>
                    {baskets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteBasket(b.id)}
                        aria-label={`Delete ${b.name}`}
                        className="px-2 text-slate-soft hover:text-ink"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  createBasket(`List ${baskets.length + 1}`);
                  setSwitcherOpen(false);
                }}
                className="block w-full border-t border-line px-3 py-2.5 text-left text-[13px] font-semibold text-copper hover:bg-mist"
              >
                + New list
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-2 text-[13.5px] text-slate-soft">
        {active.lines.length} line{active.lines.length === 1 ? "" : "s"} ·{" "}
        {units.toLocaleString("en-IN")} units
      </p>

      {active.lines.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center">
          <p className="font-display text-[19px] font-bold">This list is empty.</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-ink-3">
            Add items from the catalogue, the order pad, or upload a spreadsheet.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href="/order-pad" className="btn btn-ink">
              Open order pad
            </Link>
            <Link href="/catalog" className="btn btn-line">
              Browse catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div className="card divide-y divide-line overflow-hidden">
            {active.lines.map((l) => (
              <div key={`${l.code}-${l.variant ?? ""}`} className="flex flex-wrap items-center gap-3 p-3.5">
                <Link
                  href={`/product/${l.slug}`}
                  className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-mist"
                >
                  <ProductImage name={l.name} src={l.image || null} sizes="56px" />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${l.slug}`}
                    className="block truncate text-[13.5px] font-semibold hover:text-copper"
                  >
                    {l.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-slate-soft">
                    <span className="code-chip">{l.code}</span>
                    <span className="font-semibold text-ink-3">{l.brand}</span>
                    {l.variant && <span>{l.variant}</span>}
                  </p>
                  <input
                    value={l.note}
                    onChange={(e) => setNote(l.code, l.variant, e.target.value)}
                    placeholder="+ add a note"
                    className="mt-1.5 w-full max-w-xs border-none bg-transparent p-0 text-[12px] text-slate-soft outline-none placeholder:text-slate-soft/70 focus:text-ink"
                  />
                </div>

                {l.boxQty && (
                  <div className="flex overflow-hidden rounded-md border border-line-2">
                    {(["pcs", "box"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUom(l.code, l.variant, u)}
                        aria-pressed={l.uom === u}
                        className={`px-2 py-1 text-[11px] font-semibold transition-colors ${
                          l.uom === u ? "bg-ink text-paper" : "text-slate-soft hover:bg-mist"
                        }`}
                      >
                        {u === "pcs" ? "Pcs" : "Box"}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex h-9 items-stretch overflow-hidden rounded-lg border border-line-2">
                  <button
                    type="button"
                    onClick={() => setQty(l.code, l.variant, Math.max(1, l.qty - 1))}
                    aria-label={`Decrease quantity for ${l.name}`}
                    className="w-8 text-[15px] text-slate-soft hover:bg-mist hover:text-ink"
                  >
                    −
                  </button>
                  <input
                    value={l.qty}
                    onChange={(e) =>
                      setQty(l.code, l.variant, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))
                    }
                    inputMode="numeric"
                    aria-label={`Quantity for ${l.name}`}
                    className="w-12 border-x border-line bg-transparent text-center font-mono text-[13px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(l.code, l.variant, l.qty + 1)}
                    aria-label={`Increase quantity for ${l.name}`}
                    className="w-8 text-[15px] text-slate-soft hover:bg-mist hover:text-ink"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(l.code, l.variant)}
                  aria-label={`Remove ${l.name}`}
                  className="btn btn-ghost size-9 shrink-0 rounded-lg p-0"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex justify-end p-3.5">
              <button type="button" onClick={clear} className="text-[12.5px] text-slate-soft hover:text-ink">
                Clear this list
              </button>
            </div>
          </div>

          {/* ---- Submission form ---- */}
          <div className="lg:sticky lg:top-[196px] lg:self-start">
            <form onSubmit={submit} className="card space-y-4 p-5">
              <p className="eyebrow">Send this list</p>

              {dealer && (
                <p className="-mt-2 rounded-lg bg-ok-soft px-3 py-2 text-[12px] text-ok">
                  Filled in from your account.{" "}
                  <Link href="/account" className="font-semibold underline">
                    Not right?
                  </Link>
                </p>
              )}

              {errors.form && (
                <p className="rounded-lg bg-copper-soft px-3 py-2 text-[12.5px] text-copper">{errors.form}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 block">
                  <span className="text-[12.5px] font-medium">Firm name</span>
                  <input {...field("company")} required className="field mt-1.5" placeholder="Your firm" />
                  {errors.company && <p className="mt-1 text-[11.5px] text-copper">{errors.company}</p>}
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">Your name</span>
                  <input {...field("contact")} required className="field mt-1.5" placeholder="Contact person" />
                  {errors.contact && <p className="mt-1 text-[11.5px] text-copper">{errors.contact}</p>}
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">Phone</span>
                  <input
                    {...field("phone")}
                    required
                    inputMode="tel"
                    className="field mt-1.5"
                    placeholder="99150 33360"
                  />
                  {errors.phone && <p className="mt-1 text-[11.5px] text-copper">{errors.phone}</p>}
                </label>
                <label className="col-span-2 block">
                  <span className="text-[12.5px] font-medium">Email (optional)</span>
                  <input {...field("email")} type="email" className="field mt-1.5" placeholder="you@firm.com" />
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">GSTIN (optional)</span>
                  <input {...field("gstin")} className="field mt-1.5" placeholder="For B2B invoicing" />
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">City</span>
                  <input {...field("city")} className="field mt-1.5" placeholder="Panchkula" />
                </label>
                <label className="col-span-2 block">
                  <span className="text-[12.5px] font-medium">Site / project (optional)</span>
                  <input {...field("site")} className="field mt-1.5" placeholder="Where this order is for" />
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">Needed by</span>
                  <input {...field("deliverBy")} className="field mt-1.5" placeholder="e.g. this week" />
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-medium">Purpose</span>
                  <select {...field("purpose")} className="field mt-1.5 pr-8">
                    {PURPOSES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 block">
                  <span className="text-[12.5px] font-medium">Notes for the counter (optional)</span>
                  <textarea
                    {...field("notes")}
                    rows={3}
                    className="field mt-1.5 h-auto py-2"
                    placeholder="Colour temperature, delivery split, anything else"
                  />
                </label>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-copper w-full">
                {submitting
                  ? "Sending…"
                  : `Send enquiry · ${active.lines.length} line${active.lines.length === 1 ? "" : "s"}`}
              </button>
              <p className="text-center text-[11.5px] text-slate-soft">
                No payment is taken here. We will call or WhatsApp a proforma.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
