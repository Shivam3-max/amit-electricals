import Link from "next/link";
import ProductImage from "./ProductImage";
import QuickAdd from "./QuickAdd";
import CompareToggle from "./CompareToggle";
import type { IndexRow } from "@/lib/types";

export default function ProductCard({ row, showCompare = true }: { row: IndexRow; showCompare?: boolean }) {
  return (
    <article className="group card relative flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden border-b border-line bg-mist">
        <Link href={`/product/${row.s}`} className="absolute inset-0 block">
          <span className="relative block h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
            <ProductImage name={row.n} category={row.kl} src={row.i || null} />
          </span>
        </Link>
        <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-paper/92 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.06em] uppercase text-ink-3 backdrop-blur">
          {row.b}
        </span>
        {row.st === "indent" && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-ink/85 px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase text-white">
            Indent
          </span>
        )}
        {/* Sibling to the Link, not nested inside it — a button inside an anchor is
            invalid HTML and unreliable to hit-test. Always visible (not hover-gated)
            so it is actually reachable on touch devices, which have no hover state. */}
        {showCompare && (
          <span className="absolute bottom-2.5 right-2.5">
            <CompareToggle code={row.c} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[11px] font-medium tracking-[0.02em] uppercase text-slate-soft">{row.kl}</p>
        <h3 className="mt-1 line-clamp-2 font-sans text-[13.5px] leading-snug font-semibold tracking-normal">
          <Link href={`/product/${row.s}`} className="transition-colors hover:text-copper">
            {row.n}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
          <span className="code-chip">{row.c}</span>
          {row.w && <span className="text-slate-soft">{row.w}</span>}
          {row.v > 1 && <span className="text-slate-soft">{row.v} variants</span>}
        </div>

        <div className="mt-auto">
          <QuickAdd
            line={{
              code: row.c,
              slug: row.s,
              name: row.n,
              brand: row.b,
              variant: null,
              uom: "pcs",
              boxQty: null,
              image: row.i || "",
            }}
          />
        </div>
      </div>
    </article>
  );
}
