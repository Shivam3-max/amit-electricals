"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { IndexRow } from "@/lib/types";

export type Rail = { key: string; label: string; href: string; rows: IndexRow[] };

/** Tabbed product rail — the fastest way to skim what a department carries. */
export default function ProductRail({ rails }: { rails: Rail[] }) {
  const [active, setActive] = useState(rails[0]?.key ?? "");
  const rail = rails.find((r) => r.key === active) ?? rails[0];
  if (!rail) return null;

  return (
    <div>
      <div className="no-scrollbar -mx-5 mb-6 flex gap-1.5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        {rails.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setActive(r.key)}
            aria-pressed={r.key === active}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              r.key === active
                ? "border-ink bg-ink text-paper"
                : "border-line-2 bg-paper text-ink-2 hover:border-ink-3"
            }`}
          >
            {r.label}
          </button>
        ))}
        <Link
          href={rail.href}
          className="ml-auto hidden shrink-0 items-center px-3 text-[13px] font-semibold text-copper hover:underline lg:flex"
        >
          All {rail.label.toLowerCase()} →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {rail.rows.map((row) => (
          <ProductCard key={row.c} row={row} />
        ))}
      </div>

      <Link href={rail.href} className="btn btn-line mt-6 w-full lg:hidden">
        All {rail.label.toLowerCase()}
      </Link>
    </div>
  );
}
