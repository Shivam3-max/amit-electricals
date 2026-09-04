"use client";

import { useCompare } from "@/lib/useCompare";

export default function CompareToggle({ code, label = false }: { code: string; label?: boolean }) {
  const { codes, toggle, ready, full } = useCompare();
  const on = codes.includes(code);
  const blocked = !on && full;

  if (label) {
    return (
      <button
        type="button"
        onClick={() => toggle(code)}
        disabled={!ready || blocked}
        title={blocked ? "Compare tray is full" : undefined}
        className={`btn btn-sm ${on ? "btn-copper" : "btn-line"}`}
      >
        {on ? "In compare" : blocked ? "Tray full" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(code);
      }}
      disabled={!ready || blocked}
      aria-label={on ? `Remove ${code} from compare` : `Add ${code} to compare`}
      title={blocked ? "Compare tray is full" : "Compare"}
      className={`flex size-8 items-center justify-center rounded-lg border text-[11px] font-semibold transition-colors ${
        on
          ? "border-copper bg-copper text-white"
          : "border-line-2 bg-paper/92 text-ink-3 backdrop-blur hover:border-ink-3 disabled:opacity-40"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
        {on ? <path d="M20 6 9 17l-5-5" /> : <path d="M4 7h9M4 12h16M4 17h9M17 4l3 3-3 3M17 14l3 3-3 3" />}
      </svg>
    </button>
  );
}
