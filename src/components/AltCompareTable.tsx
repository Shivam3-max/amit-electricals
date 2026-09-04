import Link from "next/link";
import ProductImage from "./ProductImage";
import CompareToggle from "./CompareToggle";
import type { Product } from "@/lib/types";

/**
 * Same category, different brand — laid out spec-first so the buyer can see
 * what actually differs before adding anything to compare.
 */
export default function AltCompareTable({ current, alts }: { current: Product; alts: Product[] }) {
  if (!alts.length) return null;

  const keys = [...new Set([current, ...alts].flatMap((p) => Object.keys(p.specs)))].slice(0, 6);
  const rows = [current, ...alts];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr>
            <th className="w-40 border-b border-line py-2.5 text-left align-bottom">
              <span className="eyebrow">Brand</span>
            </th>
            {rows.map((p) => (
              <th key={p.code} className="border-b border-line px-3 py-2.5 text-left align-bottom">
                <Link
                  href={`/product/${p.slug}`}
                  className={`inline-flex items-center gap-2 font-display text-[15px] font-bold tracking-[-0.01em] transition-colors hover:text-copper ${
                    p.code === current.code ? "text-copper" : ""
                  }`}
                >
                  <span className="relative size-8 shrink-0 overflow-hidden rounded border border-line bg-mist">
                    <ProductImage
                      name={p.name}
                      category={p.category}
                      src={p.localImages[0] || null}
                      sizes="32px"
                    />
                  </span>
                  {p.brand}
                </Link>
                {p.code === current.code && (
                  <span className="mt-1 block font-mono text-[10px] tracking-[0.06em] text-copper uppercase">
                    Viewing
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="border-b border-line py-2.5 text-left text-ink-3">Product</th>
            {rows.map((p) => (
              <td key={p.code} className="border-b border-line px-3 py-2.5 text-ink-2">
                <span className="line-clamp-2">{p.name}</span>
                <span className="code-chip mt-0.5 block">{p.code}</span>
              </td>
            ))}
          </tr>
          {keys.map((k) => (
            <tr key={k}>
              <th className="border-b border-line py-2.5 text-left text-ink-3">{k}</th>
              {rows.map((p) => (
                <td key={p.code} className="border-b border-line px-3 py-2.5 text-ink-2">
                  {p.specs[k] ?? <span className="text-line-2">—</span>}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th className="py-3 text-left text-ink-3">Compare tray</th>
            {rows.map((p) => (
              <td key={p.code} className="px-3 py-3">
                <CompareToggle code={p.code} label />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
