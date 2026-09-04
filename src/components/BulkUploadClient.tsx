"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { useBasket } from "./BasketProvider";
import { parseCsv, rowsFromCsv } from "@/lib/csv";
import type { IndexRow } from "@/lib/types";

type Matched = {
  input: string;
  qty: number;
  row: IndexRow | null;
  status: "ok" | "guess" | "missing";
  skip: boolean;
};

const SAMPLE = `code,qty\nFPENSST038P,24\nSUR-65037B,10\n20W LED batten,60\n`;

export default function BulkUploadClient() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Matched[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMany, ready } = useBasket();

  const run = async (file: File) => {
    setError(null);
    setAdded(null);
    if (!/\.csv$/i.test(file.name)) {
      setError(
        "Please upload a .csv file. If your list is in Excel, use File → Save As → CSV (Comma delimited) and upload that.",
      );
      return;
    }
    setFileName(file.name);
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = rowsFromCsv(parseCsv(text)).slice(0, 500);
      if (!parsed.length) {
        setError("That file didn't have any readable rows. Check the format against the sample below.");
        setRows([]);
        return;
      }
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: parsed.map((p) => p.term) }),
      });
      const data = (await res.json()) as {
        resolved: { input: string; row: IndexRow | null; status: "ok" | "guess" | "missing" }[];
      };
      setRows(
        data.resolved.map((r, i) => ({
          ...r,
          qty: parsed[i]?.qty ?? 1,
          skip: r.status === "missing",
        })),
      );
    } catch {
      setError("Could not read that file. Try re-saving it as CSV and upload again.");
    } finally {
      setBusy(false);
    }
  };

  const commit = () => {
    const use = rows.filter((r) => r.row && !r.skip);
    addMany(
      use.map((r) => ({
        code: r.row!.c,
        slug: r.row!.s,
        name: r.row!.n,
        brand: r.row!.b,
        variant: null,
        qty: r.qty,
        uom: "pcs" as const,
        boxQty: null,
        note: "",
        image: r.row!.i || "",
      })),
    );
    setAdded(use.length);
    setRows([]);
    setFileName(null);
  };

  const ok = rows.filter((r) => r.status === "ok" && !r.skip).length;
  const guesses = rows.filter((r) => r.status === "guess" && !r.skip).length;
  const missing = rows.filter((r) => r.status === "missing").length;
  const usable = rows.filter((r) => r.row && !r.skip).length;

  return (
    <div>
      {!fileName && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) run(f);
          }}
          className={`flex flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-16 text-center transition-colors ${
            drag ? "border-copper bg-copper-soft" : "border-line-2 bg-mist"
          }`}
        >
          <span className="flex size-12 items-center justify-center rounded-xl border border-line-2 bg-paper">
            <svg viewBox="0 0 24 24" className="size-5 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </span>
          <p className="mt-4 font-display text-[17px] font-bold">Drop a .csv file here</p>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-soft">
            Or choose a file. Export an Excel schedule as CSV (File → Save As → CSV) first.
          </p>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-ink mt-5">
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && run(e.target.files[0])}
          />
        </div>
      )}

      {busy && (
        <p className="mt-4 text-[13.5px] text-slate-soft">Matching “{fileName}” against the catalogue…</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-copper/30 bg-copper-soft px-4 py-3 text-[13px] text-copper">
          {error}
        </p>
      )}

      {added !== null && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-ok/25 bg-ok-soft px-4 py-3 text-[13px] font-medium text-ok">
          <span>{added} line{added === 1 ? "" : "s"} added to your enquiry list.</span>
          <Link href="/enquiry" className="font-semibold underline">
            Review list →
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="text-[13px] text-ink-3">
              <span className="font-semibold text-ok">{ok} matched</span>
              {guesses > 0 && <span className="ml-2 font-semibold text-copper">{guesses} to confirm</span>}
              {missing > 0 && <span className="ml-2 font-semibold text-slate-soft">{missing} not found</span>}
            </p>
            <button
              type="button"
              onClick={() => {
                setRows([]);
                setFileName(null);
                setAdded(null);
              }}
              className="ml-auto text-[12.5px] font-semibold text-slate-soft hover:text-ink"
            >
              Start over
            </button>
          </div>

          <div className="card divide-y divide-line overflow-hidden">
            {rows.map((r, i) => (
              <div
                key={`${r.input}-${i}`}
                className={`flex flex-wrap items-center gap-3 p-3 ${r.skip ? "opacity-45" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={!r.skip}
                  disabled={!r.row}
                  onChange={() =>
                    setRows((rs) => rs.map((x, j) => (j === i ? { ...x, skip: !x.skip } : x)))
                  }
                  className="size-4 accent-ink"
                  aria-label={`Include ${r.input}`}
                />
                <span className="relative size-10 shrink-0 overflow-hidden rounded border border-line bg-mist">
                  <ProductImage
                    name={r.row?.n ?? r.input}
                    category={r.row?.kl}
                    src={r.row?.i || null}
                    sizes="40px"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{r.row?.n ?? r.input}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-soft">
                    {r.row ? (
                      <>
                        <span className="code-chip">{r.row.c}</span>
                        <span className="font-semibold text-ink-3">{r.row.b}</span>
                        {r.status === "guess" && (
                          <span className="rounded bg-copper-soft px-1.5 py-0.5 font-medium text-copper">
                            closest match to “{r.input}”
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-medium text-slate-soft">
                        No catalogue match for “{r.input}” — we can quote it on request
                      </span>
                    )}
                  </p>
                </div>
                <input
                  value={r.qty}
                  onChange={(e) =>
                    setRows((rs) =>
                      rs.map((x, j) =>
                        j === i
                          ? { ...x, qty: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) }
                          : x,
                      ),
                    )
                  }
                  inputMode="numeric"
                  aria-label={`Quantity for ${r.row?.n ?? r.input}`}
                  className="field h-9 w-16 shrink-0 text-center font-mono text-[12.5px]"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={commit}
              disabled={!ready || usable === 0}
              className="btn btn-copper disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add {usable} line{usable === 1 ? "" : "s"} to enquiry list
            </button>
            {missing > 0 && (
              <Link href="/contact" className="text-[12.5px] font-semibold text-copper hover:underline">
                Ask the counter about the {missing} unmatched line{missing === 1 ? "" : "s"}
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 card p-5">
        <p className="eyebrow">Expected format</p>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-3">
          Two columns — a catalogue code or product description, and a quantity. A header row is
          optional; we detect <code className="code-chip">code</code>/<code className="code-chip">sku</code>{" "}
          and <code className="code-chip">qty</code>/<code className="code-chip">quantity</code> if present.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink px-4 py-3 font-mono text-[12px] leading-relaxed text-white/80">
          {SAMPLE}
        </pre>
      </div>
    </div>
  );
}
