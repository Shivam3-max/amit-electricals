import Link from "next/link";
import { catalog, departments, brands as brandList } from "@/lib/catalog";
import { db } from "@/lib/db";
import ProductImage from "@/components/ProductImage";

const PER_PAGE = 60;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminCatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim().toLowerCase();
  const brand = one(sp.brand);
  const dept = one(sp.dept);
  const photo = one(sp.photo); // "missing"
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const overrideCodes = new Set((await db.productOverride.findMany({ select: { code: true } })).map((o) => o.code));

  let rows = catalog;
  if (q) rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  if (brand) rows = rows.filter((p) => p.brand === brand);
  if (dept) rows = rows.filter((p) => p.dept === dept);
  if (photo === "missing") rows = rows.filter((p) => !p.localImages.length);

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, pages);
  const pageRows = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const withPhoto = catalog.filter((p) => p.localImages.length > 0).length;
  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, brand, dept, photo, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, String(v));
    const s = params.toString();
    return s ? `/admin/catalog?${s}` : "/admin/catalog";
  };

  return (
    <div className="p-5 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Products</h1>
        </div>
        <Link href="/admin/catalog/new" className="btn btn-copper">
          + Add product
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-[11.5px] text-slate-soft">Total products</p>
          <p className="mt-1.5 font-display text-[22px] font-bold">{catalog.length.toLocaleString("en-IN")}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11.5px] text-slate-soft">With a photo</p>
          <p className="mt-1.5 font-display text-[22px] font-bold">
            {Math.round((withPhoto / catalog.length) * 100)}%
          </p>
        </div>
        <Link href={qs({ photo: "missing", page: undefined })} className="card p-4 transition-shadow hover:shadow-lift">
          <p className="text-[11.5px] text-slate-soft">Missing a photo</p>
          <p className="mt-1.5 font-display text-[22px] font-bold text-copper">{catalog.length - withPhoto}</p>
        </Link>
        <div className="card p-4">
          <p className="text-[11.5px] text-slate-soft">Edited in admin</p>
          <p className="mt-1.5 font-display text-[22px] font-bold">{overrideCodes.size}</p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-2" action="/admin/catalog" method="get">
        <input
          name="q"
          defaultValue={one(sp.q)}
          placeholder="Search name or code"
          className="field h-10 flex-1 sm:max-w-xs"
        />
        <select name="brand" defaultValue={brand ?? ""} className="field h-10 w-auto pr-8">
          <option value="">All brands</option>
          {brandList.map((b) => (
            <option key={b.slug} value={b.label}>
              {b.label}
            </option>
          ))}
        </select>
        <select name="dept" defaultValue={dept ?? ""} className="field h-10 w-auto pr-8">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.label}
            </option>
          ))}
        </select>
        {photo === "missing" && <input type="hidden" name="photo" value="missing" />}
        <button type="submit" className="btn btn-sm btn-line">
          Filter
        </button>
        {(q || brand || dept || photo) && (
          <Link href="/admin/catalog" className="btn btn-sm btn-ghost">
            Clear
          </Link>
        )}
      </form>

      <p className="mt-4 text-[13px] text-slate-soft">{total.toLocaleString("en-IN")} products match</p>

      <div className="mt-3 card overflow-hidden">
        {pageRows.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-slate-soft">Nothing matches those filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-line bg-mist text-left">
                  <th className="px-4 py-2.5 font-medium text-ink-3">Product</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Brand</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Category</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Stock</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.code} className="border-b border-line last:border-0 hover:bg-mist">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="relative size-9 shrink-0 overflow-hidden rounded border border-line bg-mist">
                          <ProductImage name={p.name} category={p.category} src={p.localImages[0] || null} sizes="36px" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="flex items-center gap-1.5">
                            <span className="code-chip">{p.code}</span>
                            {overrideCodes.has(p.code) && (
                              <span className="rounded bg-copper-soft px-1 py-0.5 font-mono text-[9px] uppercase text-copper">
                                edited
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-ink-2">{p.brand}</td>
                    <td className="px-4 py-2.5 text-ink-2">{p.category}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                          p.stock === "indent" ? "bg-mist-2 text-ink-3" : "bg-ok-soft text-ok"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/catalog/${p.code}`} className="text-[12.5px] font-semibold text-copper hover:underline">
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {current > 1 && (
            <Link href={qs({ page: current - 1 })} className="btn btn-sm btn-line">
              ← Prev
            </Link>
          )}
          <span className="px-3 font-mono text-[12.5px] text-slate-soft">
            Page {current} of {pages}
          </span>
          {current < pages && (
            <Link href={qs({ page: current + 1 })} className="btn btn-sm btn-line">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
