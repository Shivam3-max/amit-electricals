"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "./ProductImage";
import type { IndexRow } from "@/lib/types";

const QUICK = ["1.5 sq mm wire", "BLDC ceiling fan", "20W batten", "32A MCB", "9W LED bulb"];

export default function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<IndexRow[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRows([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=8`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: IndexRow[] };
        setRows(data.results ?? []);
        setCursor(-1);
      } catch {
        /* aborted or offline — leave the previous rows in place */
      } finally {
        setBusy(false);
      }
    }, 170);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(rows.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(-1, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && rows[cursor]) go(`/product/${rows[cursor].s}`);
      else if (q.trim()) go(`/catalog?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5 21 21" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          placeholder="Search 2,500+ items by name or catalogue code"
          className="field h-11 pl-10 pr-24"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10.5px] tracking-[0.08em] uppercase text-slate-soft">
          {busy ? "…" : "code or name"}
        </span>
      </div>

      {open && (
        <div
          id="search-results"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-line bg-paper shadow-pop"
        >
          {q.trim().length < 2 ? (
            <div className="p-4">
              <p className="eyebrow">Try</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="rounded-full border border-line bg-mist px-2.5 py-1 text-[12.5px] transition-colors hover:border-ink-3"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] text-slate-soft">
                Ordering a long list? The{" "}
                <Link href="/order-pad" className="font-semibold text-copper hover:underline">
                  order pad
                </Link>{" "}
                takes 50 codes at a time.
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-[13.5px] font-semibold">Nothing matched “{q.trim()}”.</p>
              <p className="mt-1 text-[12.5px] text-slate-soft">
                Try a shorter term, or{" "}
                <Link href="/contact" className="font-semibold text-copper hover:underline">
                  ask the counter
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <ul className="max-h-[62vh] overflow-y-auto">
                {rows.map((r, i) => (
                  <li key={r.c}>
                    <Link
                      href={`/product/${r.s}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setCursor(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        cursor === i ? "bg-mist" : ""
                      }`}
                    >
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-line bg-mist">
                        <ProductImage name={r.n} category={r.kl} src={r.i || null} sizes="44px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium">{r.n}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-soft">
                          <span className="font-semibold text-ink-3">{r.b}</span>
                          <span className="code-chip">{r.c}</span>
                          <span className="truncate">{r.kl}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/catalog?q=${encodeURIComponent(q.trim())}`}
                onClick={() => setOpen(false)}
                className="block border-t border-line bg-mist px-4 py-2.5 text-center text-[12.5px] font-semibold text-ink-2 transition-colors hover:text-copper"
              >
                See all results for “{q.trim()}”
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
