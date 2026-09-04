"use client";

import Link from "next/link";
import { COMPARE_MAX, useCompare } from "@/lib/useCompare";

/** Floating tray that appears once the buyer has picked something to compare. */
export default function CompareTray() {
  const { codes, remove, clear, ready } = useCompare();
  if (!ready || codes.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border border-ink-3/20 bg-ink px-4 py-3 text-white shadow-pop">
        <p className="hidden font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/50 sm:block">
          Compare {codes.length}/{COMPARE_MAX}
        </p>
        <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {codes.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => remove(c)}
                className="group flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 font-mono text-[11px] transition-colors hover:bg-white/20"
                aria-label={`Remove ${c} from compare`}
              >
                {c}
                <span className="text-white/50 group-hover:text-white">×</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={clear}
          className="hidden text-[12.5px] text-white/55 transition-colors hover:text-white sm:block"
        >
          Clear
        </button>
        <Link href="/compare" className="btn btn-sm bg-volt text-ink hover:bg-white">
          Compare
        </Link>
      </div>
    </div>
  );
}
