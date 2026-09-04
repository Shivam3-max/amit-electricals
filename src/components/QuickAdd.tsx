"use client";

import { useState } from "react";
import { useBasket } from "./BasketProvider";
import type { BasketLine } from "@/lib/types";

type Props = {
  line: Omit<BasketLine, "qty" | "note">;
  step?: number;
  compact?: boolean;
};

/**
 * Quantity stepper + add. Trade quantities jump in tens, so the stepper moves
 * by a sensible step and the field still accepts any number typed directly.
 */
export default function QuickAdd({ line, step = 10, compact = false }: Props) {
  const { add, ready } = useBasket();
  const [qty, setQty] = useState(step);
  const [added, setAdded] = useState(false);

  const commit = () => {
    add({ ...line, qty, note: "" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    // A narrow 2-up mobile card has ~140px for this whole row — the stepper
    // and button never both fit on one line at that width, so they stack
    // instead of squeezing (which read as the button's text overlapping).
    // From sm: up, cards are wide enough for the original side-by-side row.
    <div className={`flex flex-col gap-1.5 sm:flex-row sm:items-stretch ${compact ? "" : "mt-3"}`}>
      <div className="flex h-9 items-stretch self-stretch overflow-hidden rounded-lg border border-line-2 bg-paper sm:self-auto">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - step))}
          aria-label="Decrease quantity"
          className="w-9 shrink-0 text-[15px] leading-none text-slate-soft transition-colors hover:bg-mist hover:text-ink sm:w-8"
        >
          −
        </button>
        <input
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(999999, Number(e.target.value.replace(/\D/g, "")) || 1)))}
          inputMode="numeric"
          aria-label="Quantity"
          className="w-full min-w-0 flex-1 border-x border-line bg-transparent text-center font-mono text-[12.5px] outline-none sm:w-11 sm:flex-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(999999, q + step))}
          aria-label="Increase quantity"
          className="w-9 shrink-0 text-[15px] leading-none text-slate-soft transition-colors hover:bg-mist hover:text-ink sm:w-8"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={commit}
        disabled={!ready}
        className={`btn btn-sm h-9 w-full sm:flex-1 ${added ? "btn-copper" : "btn-ink"}`}
      >
        {added ? (
          <>
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Added
          </>
        ) : (
          "Add to list"
        )}
      </button>
    </div>
  );
}
