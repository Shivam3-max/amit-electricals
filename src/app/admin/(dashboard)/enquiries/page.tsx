import Link from "next/link";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "DISPATCHED", "CLOSED", "CANCELLED"] as const;

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-copper-soft text-copper",
  REVIEWING: "bg-mist-2 text-ink-3",
  QUOTED: "bg-ok-soft text-ok",
  CONFIRMED: "bg-ok-soft text-ok",
  DISPATCHED: "bg-ink text-white",
  CLOSED: "bg-mist text-slate-soft",
  CANCELLED: "bg-mist text-slate-soft line-through",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = one(sp.status);
  const q = one(sp.q)?.trim();

  const where: Prisma.EnquiryWhereInput = {};
  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) where.status = status as never;
  if (q) {
    where.OR = [
      { ref: { contains: q } },
      { company: { contains: q } },
      { contact: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const [enquiries, counts] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { receivedAt: "desc" }, include: { lines: true }, take: 200 }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((n, c) => n + c._count, 0);

  return (
    <div className="p-5 lg:p-8">
      <p className="eyebrow">Orders</p>
      <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Enquiries</h1>

      <div className="no-scrollbar mt-5 flex gap-1.5 overflow-x-auto">
        <FilterPill href="/admin/enquiries" active={!status} label="All" count={total} />
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={`/admin/enquiries?status=${s}`}
            active={status === s}
            label={s[0] + s.slice(1).toLowerCase()}
            count={countFor(s)}
          />
        ))}
      </div>

      <form className="mt-4 max-w-sm" action="/admin/enquiries" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search ref, company or phone"
          className="field h-10"
        />
      </form>

      <div className="mt-5 card overflow-hidden">
        {enquiries.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-slate-soft">No enquiries match that filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-line bg-mist text-left">
                  <th className="px-4 py-2.5 font-medium text-ink-3">Reference</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Company</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Purpose</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Lines</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Received</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0 hover:bg-mist">
                    <td className="px-4 py-3">
                      <Link href={`/admin/enquiries/${e.id}`} className="code-chip font-semibold text-copper">
                        {e.ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.company}</p>
                      <p className="text-[11.5px] text-slate-soft">{e.contact} · {e.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{e.purpose}</td>
                    <td className="px-4 py-3 text-ink-2">{e.lines.length}</td>
                    <td className="px-4 py-3 text-ink-2">
                      {e.receivedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${STATUS_TONE[e.status]}`}>
                        {e.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-line-2 bg-paper text-ink-2 hover:border-ink-3"
      }`}
    >
      {label} <span className="font-mono text-[10.5px] opacity-70">{count}</span>
    </Link>
  );
}
