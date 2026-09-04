"use client";

/**
 * Order pad — the way a trade buyer actually orders.
 *
 * One row per line item: type a catalogue code or a few words, pick from the
 * typeahead, set a quantity, move on with the keyboard. Rows resolve against
 * the live catalogue, so a pasted code list becomes a priced-on-enquiry basket
 * without anyone browsing a single category page.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useBasket } from "./BasketProvider";
import ProductImage from "./ProductImage";
import type { IndexRow } from "@/lib/types";

type Row = {
  id: string;
  term: string;
  qty: number;
  picked: IndexRow | null;
  /** Set when the row came from a paste and we matched it loosely. */
  fuzzy?: boolean;
};

const newRow = (): Row => ({ id: Math.random().toString(36).slice(2, 9), term: "", qty: 10, picked: null });

export default function OrderPad({
  initialRows = 8,
  compact = false,
}: {
  initialRows?: number;
  compact?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: initialRows }, newRow));
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<IndexRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [paste, setPaste] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const { addMany, ready } = useBasket();
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const activeRow = rows.find((r) => r.id === openRow) ?? null;

  // Typeahead for whichever row has focus.
  useEffect(() => {
    const term = activeRow?.term.trim() ?? "";
    if (!activeRow || term.length < 2 || activeRow.picked?.n === activeRow.term) {
      setSuggest([]);
      return;
    }
    setBusy(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=7`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: IndexRow[] };
        setSuggest(data.results ?? []);
      } catch {
        /* aborted */
      } finally {
        setBusy(false);
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [activeRow?.id, activeRow?.term, activeRow?.picked?.n, activeRow]);

  const patch = (id: string, p: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const pick = (id: string, row: IndexRow) => {
    patch(id, { picked: row, term: row.n, fuzzy: false });
    setOpenRow(null);
    setSuggest([]);
    // Advance to the next empty row so a long list stays a single keyboard run.
    const idx = rows.findIndex((r) => r.id === id);
    const next = rows[idx + 1];
    if (next) cellRefs.current[next.id]?.focus();
    else addRow();
  };

  const addRow = () => {
    const r = newRow();
    setRows((rs) => [...rs, r]);
    requestAnimationFrame(() => cellRefs.current[r.id]?.focus());
  };

  const filled = useMemo(() => rows.filter((r) => r.picked), [rows]);

  const commit = () => {
    if (!filled.length) return;
    addMany(
      filled.map((r) => ({
        code: r.picked!.c,
        slug: r.picked!.s,
        name: r.picked!.n,
        brand: r.picked!.b,
        variant: null,
        qty: r.qty,
        uom: "pcs" as const,
        boxQty: null,
        note: "",
        image: r.picked!.i || "",
      })),
    );
    setFlash(`${filled.length} line${filled.length > 1 ? "s" : ""} added to your enquiry list.`);
    setRows(Array.from({ length: initialRows }, newRow));
    setTimeout(() => setFlash(null), 4000);
  };

  /** Paste a block of "code, qty" lines from a spreadsheet or WhatsApp message. */
  const runPaste = async () => {
    const parsed = paste
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 120)
      .map((l) => {
        const m = l.match(/^(.*?)[\s,;\t]+(\d{1,6})\s*(?:pcs|nos|no|qty)?$/i);
        return m ? { term: m[1].trim(), qty: Number(m[2]) } : { term: l, qty: 1 };
      });
    if (!parsed.length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: parsed.map((p) => p.term) }),
      });
      const data = (await res.json()) as {
        resolved: { input: string; row: IndexRow | null; status: string }[];
      };
      const next: Row[] = data.resolved.map((r, i) => ({
        id: Math.random().toString(36).slice(2, 9),
        term: r.row ? r.row.n : r.input,
        qty: parsed[i]?.qty || 1,
        picked: r.row,
        fuzzy: r.status === "guess",
      }));
      setRows([...next, ...Array.from({ length: 2 }, newRow)]);
      setPasteMode(false);
      setPaste("");
    } catch {
      setFlash("Could not read that list. Check the format and try again.");
      setTimeout(() => setFlash(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  const unresolved = rows.filter((r) => r.term.trim() && !r.picked).length;
  const guesses = rows.filter((r) => r.fuzzy).length;

  return (
    <div className={compact ? "" : "card overflow-hidden"}>
      {!compact && (
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-mist px-4 py-3">
          <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-slate-soft">
            {rows.length} rows · {filled.length} matched
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPasteMode((v) => !v)}
              className={`btn btn-sm ${pasteMode ? "btn-ink" : "btn-line"}`}
            >
              Paste a list
            </button>
            <Link href="/bulk-upload" className="btn btn-sm btn-line">
              Upload CSV
            </Link>
          </div>
        </div>
      )}

      {pasteMode && (
        <div className="border-b border-line bg-copper-soft px-4 py-4">
          <label htmlFor="paste-block" className="text-[13px] font-semibold">
            One item per line — code or description, then quantity
          </label>
          <textarea
            id="paste-block"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={5}
            placeholder={"FPENSST038P, 24\nGreen Wire 1.5 sqmm, 40\n20W LED batten 60"}
            className="field mt-2 h-auto py-2 font-mono text-[12.5px]"
          />
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={runPaste} disabled={busy} className="btn btn-sm btn-copper">
              {busy ? "Matching…" : "Match to catalogue"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasteMode(false);
                setPaste("");
              }}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-line">
        {rows.map((r, n) => {
          const isOpen = openRow === r.id && suggest.length > 0;
          return (
            <div key={r.id} className="relative">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="w-5 shrink-0 text-right font-mono text-[11px] text-slate-soft">
                  {n + 1}
                </span>

                <div className="relative min-w-0 flex-1">
                  <input
                    ref={(el) => {
                      cellRefs.current[r.id] = el;
                    }}
                    value={r.term}
                    onChange={(e) => patch(r.id, { term: e.target.value, picked: null, fuzzy: false })}
                    onFocus={() => setOpenRow(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && suggest[0] && !r.picked) {
                        e.preventDefault();
                        pick(r.id, suggest[0]);
                      }
                      if (e.key === "Escape") setOpenRow(null);
                    }}
                    placeholder={n === 0 ? "Catalogue code or product name" : ""}
                    aria-label={`Line ${n + 1} item`}
                    className={`field h-10 pr-8 ${
                      r.picked
                        ? "border-ok/40 bg-ok-soft"
                        : r.term.trim()
                          ? "border-copper/50"
                          : ""
                    }`}
                  />
                  {r.picked && (
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ok">
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                </div>

                <input
                  value={r.qty}
                  onChange={(e) =>
                    patch(r.id, {
                      qty: Math.max(1, Math.min(999999, Number(e.target.value.replace(/\D/g, "")) || 1)),
                    })
                  }
                  inputMode="numeric"
                  aria-label={`Line ${n + 1} quantity`}
                  className="field h-10 w-16 shrink-0 text-center font-mono text-[13px]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : [newRow()]))
                  }
                  aria-label={`Clear line ${n + 1}`}
                  className="btn btn-ghost size-9 shrink-0 rounded-lg p-0"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {r.picked && (
                <p className="flex items-center gap-2 px-10 pb-2 text-[11.5px] text-slate-soft">
                  <span className="code-chip">{r.picked.c}</span>
                  <span className="font-semibold text-ink-3">{r.picked.b}</span>
                  <span className="truncate">{r.picked.kl}</span>
                  {r.fuzzy && (
                    <span className="rounded bg-copper-soft px-1.5 py-0.5 font-medium text-copper">
                      closest match — please confirm
                    </span>
                  )}
                </p>
              )}

              {isOpen && (
                <ul className="absolute inset-x-3 top-[calc(100%-4px)] z-30 overflow-hidden rounded-lg border border-line bg-paper shadow-pop">
                  {suggest.map((s) => (
                    <li key={s.c}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(r.id, s)}
                        className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-mist"
                      >
                        <span className="relative size-9 shrink-0 overflow-hidden rounded border border-line bg-mist">
                          <ProductImage name={s.n} category={s.kl} src={s.i || null} sizes="36px" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">{s.n}</span>
                          <span className="flex gap-2 text-[11px] text-slate-soft">
                            <span className="code-chip">{s.c}</span>
                            <span>{s.b}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-mist px-4 py-3">
        <button type="button" onClick={addRow} className="btn btn-sm btn-line">
          + Add row
        </button>
        {!compact && (
          <p className="text-[12px] text-slate-soft">
            {unresolved > 0 && `${unresolved} line${unresolved > 1 ? "s" : ""} not matched yet. `}
            {guesses > 0 && `${guesses} loose match${guesses > 1 ? "es" : ""} to confirm.`}
            {unresolved === 0 && guesses === 0 && "Press Enter to accept the top suggestion."}
          </p>
        )}
        <button
          type="button"
          onClick={commit}
          disabled={!ready || filled.length === 0}
          className="btn btn-sm btn-copper ml-auto disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add {filled.length || ""} to enquiry list
        </button>
      </div>

      {flash && (
        <p
          role="status"
          className="flex items-center justify-between gap-3 border-t border-ok/25 bg-ok-soft px-4 py-2.5 text-[13px] font-medium text-ok"
        >
          {flash}
          <Link href="/enquiry" className="font-semibold underline">
            Review list →
          </Link>
        </p>
      )}
    </div>
  );
}
