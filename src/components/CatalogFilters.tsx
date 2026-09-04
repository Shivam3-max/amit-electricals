"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { FacetGroup } from "@/lib/filter";

const SORTS = [
  { value: "relevance", label: "Most relevant" },
  { value: "name", label: "Name A–Z" },
  { value: "brand", label: "Brand" },
  { value: "variants", label: "Most variants" },
];

/**
 * Facet shell: renders the toolbar, the desktop sidebar and the mobile drawer,
 * and lays the product grid out beside them. Taking the grid as children keeps
 * one piece of drawer state in one place while the server still renders every
 * product card.
 */
export default function CatalogFilters({
  groups,
  total,
  /** Category options route to their own URL rather than a query param. */
  categoryBase,
  children,
}: {
  groups: FacetGroup[];
  total: number;
  categoryBase?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const active = useMemo(
    () =>
      ["brand", "spec", "stock", "cat"].filter((k) => params.get(k)),
    [params],
  );

  const push = (next: URLSearchParams) => {
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggle = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    // Changing brand or spec invalidates a narrower selection below it.
    if (key === "brand" || key === "spec") next.delete("cat");
    push(next);
  };

  const clearAll = () => {
    const next = new URLSearchParams(params.toString());
    ["brand", "spec", "stock", "cat"].forEach((k) => next.delete(k));
    push(next);
  };

  const setSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "relevance") next.delete("sort");
    else next.set("sort", value);
    push(next);
  };

  const panel = (
    <div className="space-y-7">
      {groups.map((g) => {
        const selected = params.get(g.key);
        const isCatLinks = g.key === "cat" && categoryBase;
        return (
          <fieldset key={g.key}>
            <legend className="eyebrow mb-2.5">{g.label}</legend>
            <div className={g.options.length > 9 ? "max-h-64 overflow-y-auto pr-1" : ""}>
              <ul className="space-y-0.5">
                {g.options.map((o) => {
                  const on = selected === o.value;
                  const cls = `flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                    on ? "bg-ink text-paper" : "text-ink-2 hover:bg-mist"
                  }`;
                  const inner = (
                    <>
                      <span
                        aria-hidden="true"
                        className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border ${
                          on ? "border-paper bg-paper" : "border-line-2"
                        }`}
                      >
                        {on && (
                          <svg viewBox="0 0 24 24" className="size-3 text-ink" fill="none" stroke="currentColor" strokeWidth="3.4">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      <span className={`font-mono text-[10.5px] ${on ? "text-paper/60" : "text-slate-soft"}`}>
                        {o.count}
                      </span>
                    </>
                  );

                  return (
                    <li key={o.value}>
                      {isCatLinks ? (
                        <a href={`${categoryBase}/${o.value}`} className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <button type="button" onClick={() => toggle(g.key, o.value)} className={cls}>
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <p className="text-[13px] text-ink-3">
          <span className="font-semibold text-ink">{total.toLocaleString("en-IN")}</span> products
        </p>

        {active.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-line-2 px-2.5 py-1 text-[12px] font-medium text-ink-3 transition-colors hover:border-ink-3 hover:text-ink"
          >
            Clear {active.length} filter{active.length > 1 ? "s" : ""}
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-sm btn-line ml-auto lg:hidden"
        >
          Filters{active.length ? ` · ${active.length}` : ""}
        </button>

        <label className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="eyebrow">Sort</span>
          <select
            value={params.get("sort") ?? "relevance"}
            onChange={(e) => setSort(e.target.value)}
            className="field h-9 w-auto pr-8 text-[13px]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Sidebar + grid */}
      <div className="grid gap-8 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block lg:sticky lg:top-[196px] lg:max-h-[calc(100vh-220px)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {panel}
        </aside>
        <div>{children}</div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-paper">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-5 py-3.5">
              <h2 className="text-[16px]">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost size-9 rounded-lg p-0" aria-label="Close filters">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-5">
              <label className="mb-6 block">
                <span className="eyebrow">Sort</span>
                <select
                  value={params.get("sort") ?? "relevance"}
                  onChange={(e) => setSort(e.target.value)}
                  className="field mt-1.5"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              {panel}
            </div>
            <div className="sticky bottom-0 flex gap-2 border-t border-line bg-paper p-4">
              {active.length > 0 && (
                <button type="button" onClick={clearAll} className="btn btn-line flex-1">
                  Clear all
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ink flex-1">
                Show {total.toLocaleString("en-IN")} products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
