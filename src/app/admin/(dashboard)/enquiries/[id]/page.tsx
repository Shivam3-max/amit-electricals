import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EnquiryDetailClient from "@/components/admin/EnquiryDetailClient";

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: {
      lines: true,
      internalNotes: { orderBy: { createdAt: "asc" } },
      dealer: true,
    },
  });
  if (!enquiry) notFound();

  return (
    <div className="p-5 lg:p-8">
      <Link href="/admin/enquiries" className="text-[12.5px] font-semibold text-copper hover:underline">
        ← All enquiries
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{enquiry.ref}</p>
          <h1 className="mt-1 text-[22px] lg:text-[26px]">{enquiry.company}</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            {enquiry.contact} · {enquiry.phone}
            {enquiry.email ? ` · ${enquiry.email}` : ""}
          </p>
        </div>
        {enquiry.dealer && (
          <Link
            href={`/admin/dealers/${enquiry.dealer.id}`}
            className="rounded-full border border-line-2 bg-paper px-3 py-1.5 text-[12.5px] font-semibold text-copper hover:border-ink-3"
          >
            Registered dealer · {enquiry.dealer.tier.toLowerCase()} →
          </Link>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Meta label="GSTIN" value={enquiry.gstin || "—"} />
        <Meta label="City" value={enquiry.city || "—"} />
        <Meta label="Site" value={enquiry.site || "—"} />
        <Meta label="Needed by" value={enquiry.deliverBy || "—"} />
        <Meta label="Purpose" value={enquiry.purpose} />
        <Meta label="List name" value={enquiry.listName || "—"} />
        <Meta
          label="Received"
          value={enquiry.receivedAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        />
        <Meta label="Units" value={String(enquiry.lines.reduce((n, l) => n + l.qty, 0))} />
      </div>

      {enquiry.notes && (
        <p className="mt-4 rounded-lg border border-line bg-mist px-3.5 py-2.5 text-[13px] text-ink-2">
          <span className="font-semibold">Buyer's note: </span>
          {enquiry.notes}
        </p>
      )}

      <div className="mt-6">
        <EnquiryDetailClient
          enquiryId={enquiry.id}
          status={enquiry.status}
          assignedTo={enquiry.assignedTo}
          lines={enquiry.lines}
          notes={enquiry.internalNotes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-slate-soft">{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-medium text-ink-2">{value}</p>
    </div>
  );
}
