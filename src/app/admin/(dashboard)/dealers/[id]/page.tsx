import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import DealerRow from "@/components/admin/DealerRow";

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-copper-soft text-copper",
  REVIEWING: "bg-mist-2 text-ink-3",
  QUOTED: "bg-ok-soft text-ok",
  CONFIRMED: "bg-ok-soft text-ok",
  DISPATCHED: "bg-ink text-white",
  CLOSED: "bg-mist text-slate-soft",
  CANCELLED: "bg-mist text-slate-soft line-through",
};

export default async function AdminDealerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealer = await db.dealer.findUnique({
    where: { id },
    include: { enquiries: { orderBy: { receivedAt: "desc" }, include: { lines: true } } },
  });
  if (!dealer) notFound();

  return (
    <div className="p-5 lg:p-8">
      <Link href="/admin/dealers" className="text-[12.5px] font-semibold text-copper hover:underline">
        ← All dealers
      </Link>

      <h1 className="mt-3 text-[24px] lg:text-[28px]">{dealer.company}</h1>
      <p className="mt-1 text-[13px] text-ink-3">
        {dealer.contact} · {dealer.phone}
        {dealer.email ? ` · ${dealer.email}` : ""}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-mist text-left">
                <th className="px-4 py-2 font-medium text-ink-3">Firm</th>
                <th className="px-4 py-2 font-medium text-ink-3">Phone</th>
                <th className="px-4 py-2 font-medium text-ink-3">City</th>
                <th className="px-4 py-2 text-center font-medium text-ink-3">Enquiries</th>
                <th className="px-4 py-2 font-medium text-ink-3">Tier</th>
                <th className="px-4 py-2 font-medium text-ink-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <DealerRow
                dealer={{
                  id: dealer.id,
                  company: dealer.company,
                  contact: dealer.contact,
                  phone: dealer.phone,
                  city: dealer.city,
                  tier: dealer.tier,
                  status: dealer.status,
                  enquiryCount: dealer.enquiries.length,
                  createdAt: dealer.createdAt.toISOString(),
                }}
              />
            </tbody>
          </table>
        </div>
        <div className="card grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-[13px]">
          <Field label="GSTIN" value={dealer.gstin || "—"} />
          <Field label="Address" value={dealer.address || "—"} />
          <Field label="Email" value={dealer.email || "—"} />
          <Field
            label="Registered"
            value={dealer.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="eyebrow mb-3">Enquiry history · {dealer.enquiries.length}</p>
        <div className="card divide-y divide-line overflow-hidden">
          {dealer.enquiries.length === 0 ? (
            <p className="p-6 text-center text-[13px] text-slate-soft">No enquiries yet.</p>
          ) : (
            dealer.enquiries.map((e) => (
              <Link
                key={e.id}
                href={`/admin/enquiries/${e.id}`}
                className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-mist"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2">
                    <span className="code-chip">{e.ref}</span>
                    <span className="text-[12.5px] text-slate-soft">
                      {e.lines.length} lines · {e.receivedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </p>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${STATUS_TONE[e.status]}`}>
                  {e.status.toLowerCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-slate-soft">{label}</p>
      <p className="mt-0.5 text-ink-2">{value}</p>
    </div>
  );
}
