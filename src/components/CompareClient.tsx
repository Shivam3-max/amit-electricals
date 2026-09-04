"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import QuickAdd from "./QuickAdd";
import { useCompare, COMPARE_MAX } from "@/lib/useCompare";
import { getByCode } from "@/lib/catalog";

export default function CompareClient() {
  const { codes, remove, clear, ready } = useCompare();

  if (!ready) return null;

  const products = codes.map((c) => getByCode(c)).filter((p): p is NonNullable<typeof p> => !!p);

  if (products.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="font-display text-[19px] font-bold">Nothing in the compare tray yet.</p>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] text-ink-3">
          Open any product or category and tap the compare icon on up to {COMPARE_MAX} items to line
          them up here — spec by spec, brand by brand.
        </p>
        <Link href="/catalog" className="btn btn-ink mt-6">
          Browse the catalogue
        </Link>
      </div>
    );
  }

  const keys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))].slice(0, 10);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <p className="text-[13px] text-ink-3">
          {products.length} of {COMPARE_MAX} slots used
        </p>
        <button
          type="button"
          onClick={clear}
          className="ml-auto text-[12.5px] font-semibold text-slate-soft hover:text-ink"
        >
          Clear all
        </button>
      </div>

      <div className="card overflow-x-auto p-1">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-[13px]">
          <thead>
            <tr>
              <th className="w-36 border-b border-line py-3 text-left align-bottom">
                <span className="eyebrow">Spec</span>
              </th>
              {products.map((p) => (
                <th key={p.code} className="border-b border-line px-3 py-3 text-left align-bottom">
                  <div className="flex items-start gap-2.5">
                    <Link
                      href={`/product/${p.slug}`}
                      className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-mist"
                    >
                      <ProductImage
                        name={p.name}
                        category={p.category}
                        src={p.localImages[0] || null}
                        sizes="56px"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${p.slug}`}
                        className="block line-clamp-2 text-[13px] font-semibold hover:text-copper"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-semibold text-ink-3">{p.brand}</span>
                        <span className="code-chip">{p.code}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(p.code)}
                        className="mt-1 text-[11px] font-medium text-copper hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border-b border-line py-2.5 text-left text-ink-3">Category</th>
              {products.map((p) => (
                <td key={p.code} className="border-b border-line px-3 py-2.5 text-ink-2">
                  {p.category}
                </td>
              ))}
            </tr>
            <tr>
              <th className="border-b border-line py-2.5 text-left text-ink-3">Availability</th>
              {products.map((p) => (
                <td key={p.code} className="border-b border-line px-3 py-2.5">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] ${
                      p.stock === "indent" ? "bg-mist text-ink-3" : "bg-ok-soft text-ok"
                    }`}
                  >
                    {p.stock === "indent" ? "Indent" : "In stock"}
                  </span>
                </td>
              ))}
            </tr>
            {variantRow(products)}
            {keys.map((k) => (
              <tr key={k}>
                <th className="border-b border-line py-2.5 text-left text-ink-3">{k}</th>
                {products.map((p) => (
                  <td key={p.code} className="border-b border-line px-3 py-2.5 text-ink-2">
                    {p.specs[k] ?? <span className="text-line-2">—</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className="py-3 text-left text-ink-3">Add to list</th>
              {products.map((p) => (
                <td key={p.code} className="px-3 py-3">
                  <QuickAdd
                    compact
                    line={{
                      code: p.code,
                      slug: p.slug,
                      name: p.name,
                      brand: p.brand,
                      variant: null,
                      uom: "pcs",
                      boxQty: p.variants[0]?.boxQty ?? null,
                      image: p.localImages[0] || "",
                    }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Row rendered only when at least one product actually has variants worth noting. */
function variantRow(products: ReturnType<typeof getByCode>[]) {
  const list = products.filter((p): p is NonNullable<typeof p> => !!p);
  if (!list.some((p) => p.variants.length > 1)) return null;
  return (
    <tr>
      <th className="border-b border-line py-2.5 text-left text-ink-3">Variants available</th>
      {list.map((p) => (
        <td key={p.code} className="border-b border-line px-3 py-2.5 text-ink-2">
          {p.variants.length > 1 ? `${p.variants.length} options` : "Single spec"}
        </td>
      ))}
    </tr>
  );
}
