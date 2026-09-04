import Link from "next/link";
import { db } from "@/lib/db";
import { catalog } from "@/lib/catalog";

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-copper-soft text-copper",
  REVIEWING: "bg-mist text-ink-3",
  QUOTED: "bg-ok-soft text-ok",
  CONFIRMED: "bg-ok-soft text-ok",
  DISPATCHED: "bg-mist-2 text-ink-2",
  CLOSED: "bg-mist text-slate-soft",
  CANCELLED: "bg-mist text-slate-soft",
};

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const [
    enquiriesToday,
    enquiriesWeek,
    enquiriesTotal,
    newMessages,
    dealersTotal,
    dealersWeek,
    recentEnquiries,
    recentMessages,
  ] = await Promise.all([
    db.enquiry.count({ where: { receivedAt: { gte: startOfDay } } }),
    db.enquiry.count({ where: { receivedAt: { gte: startOfWeek } } }),
    db.enquiry.count(),
    db.message.count({ where: { status: "NEW" } }),
    db.dealer.count(),
    db.dealer.count({ where: { createdAt: { gte: startOfWeek } } }),
    db.enquiry.findMany({
      orderBy: { receivedAt: "desc" },
      take: 6,
      include: { lines: true },
    }),
    db.message.findMany({ orderBy: { receivedAt: "desc" }, take: 5 }),
  ]);

  const missingPhotos = catalog.filter((p) => !p.localImages.length).length;

  const kpis = [
    { label: "Enquiries today", value: enquiriesToday, href: "/admin/enquiries" },
    { label: "Enquiries this week", value: enquiriesWeek, href: "/admin/enquiries" },
    { label: "Unread messages", value: newMessages, href: "/admin/messages" },
    { label: "Dealers (new this week)", value: `${dealersTotal} (+${dealersWeek})`, href: "/admin/dealers" },
  ];

  return (
    <div className="p-5 lg:p-8">
      <p className="eyebrow">Overview</p>
      <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="card p-4 transition-shadow hover:shadow-lift">
            <p className="text-[11.5px] text-slate-soft">{k.label}</p>
            <p className="mt-1.5 font-display text-[24px] font-bold">{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-ink-3">
            <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="m3 17 5-4 4 3 3-2 6 5" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold">
              {missingPhotos} product{missingPhotos === 1 ? "" : "s"} missing a photo
            </p>
            <Link href="/admin/catalog?photo=missing" className="text-[12px] font-semibold text-copper hover:underline">
              Review in catalogue →
            </Link>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-ink-3">
            <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold">{enquiriesTotal} enquiries all-time</p>
            <Link href="/admin/enquiries" className="text-[12px] font-semibold text-copper hover:underline">
              Open the queue →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Recent enquiries</p>
            <Link href="/admin/enquiries" className="text-[12.5px] font-semibold text-copper hover:underline">
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-line overflow-hidden">
            {recentEnquiries.length === 0 ? (
              <p className="p-5 text-center text-[13px] text-slate-soft">Nothing yet.</p>
            ) : (
              recentEnquiries.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/enquiries/${e.id}`}
                  className="flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-mist"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2">
                      <span className="code-chip">{e.ref}</span>
                      <span className="truncate text-[13px] font-medium">{e.company}</span>
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-slate-soft">
                      {e.lines.length} line{e.lines.length === 1 ? "" : "s"} ·{" "}
                      {e.receivedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] ${STATUS_TONE[e.status]}`}
                  >
                    {e.status.toLowerCase()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Recent messages</p>
            <Link href="/admin/messages" className="text-[12.5px] font-semibold text-copper hover:underline">
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-line overflow-hidden">
            {recentMessages.length === 0 ? (
              <p className="p-5 text-center text-[13px] text-slate-soft">Nothing yet.</p>
            ) : (
              recentMessages.map((m) => (
                <div key={m.id} className="p-3.5">
                  <p className="flex items-center gap-2">
                    <span className="rounded bg-mist px-1.5 py-0.5 font-mono text-[10px] uppercase text-ink-3">
                      {m.topic}
                    </span>
                    <span className="truncate text-[13px] font-medium">{m.name}</span>
                  </p>
                  <p className="mt-1 line-clamp-1 text-[12px] text-slate-soft">{m.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
