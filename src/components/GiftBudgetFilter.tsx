"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { IndexRow } from "@/lib/types";

type Band = { id: string; range: string; note: string; rows: IndexRow[] };

/**
 * Budget pills above the gifting grid. Picking one hides the other bands
 * instead of navigating anywhere — there are only ever a handful of bands,
 * so a client-side toggle keeps it instant with no round trip.
 */
export default function GiftBudgetFilter({ bands }: { bands: Band[] }) {
  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? bands : bands.filter((b) => b.id === active);

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
        <Pill label="All budgets" active={active === "all"} onClick={() => setActive("all")} />
        {bands.map((b) => (
          <Pill
            key={b.id}
            label={b.range}
            count={b.rows.length}
            active={active === b.id}
            onClick={() => setActive(b.id)}
          />
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {visible.map((b) => (
          <div key={b.id}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-3">
              <h2 className="text-[19px]">{b.range}</h2>
              <p className="text-[13px] text-slate-soft">{b.note}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {b.rows.map((row) => (
                <ProductCard key={row.c} row={row} showCompare={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-line-2 bg-paper text-ink-2 hover:border-ink-3"
      }`}
    >
      {label}
      {count !== undefined && <span className="ml-1 font-mono text-[10.5px] opacity-70">{count}</span>}
    </button>
  );
}
