import { db } from "@/lib/db";
import DealerRow from "@/components/admin/DealerRow";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminDealersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim();

  const dealers = await db.dealer.findMany({
    where: q
      ? { OR: [{ company: { contains: q } }, { phone: { contains: q } }, { contact: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enquiries: true } } },
    take: 300,
  });

  return (
    <div className="p-5 lg:p-8">
      <p className="eyebrow">Trade accounts</p>
      <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Dealers</h1>
      <p className="mt-1.5 text-[13px] text-slate-soft">
        {dealers.length} registered · new accounts go live immediately, at Retailer rates until you
        adjust the tier here.
      </p>

      <form className="mt-4 max-w-sm" action="/admin/dealers" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search firm, contact or phone"
          className="field h-10"
        />
      </form>

      <div className="mt-5 card overflow-hidden">
        {dealers.length === 0 ? (
          <p className="p-8 text-center text-[13.5px] text-slate-soft">No dealers registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="border-b border-line bg-mist text-left">
                  <th className="px-4 py-2.5 font-medium text-ink-3">Firm</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Phone</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">City</th>
                  <th className="px-4 py-2.5 text-center font-medium text-ink-3">Enquiries</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Tier</th>
                  <th className="px-4 py-2.5 font-medium text-ink-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((d) => (
                  <DealerRow
                    key={d.id}
                    dealer={{
                      id: d.id,
                      company: d.company,
                      contact: d.contact,
                      phone: d.phone,
                      city: d.city,
                      tier: d.tier,
                      status: d.status,
                      enquiryCount: d._count.enquiries,
                      createdAt: d.createdAt.toISOString(),
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
