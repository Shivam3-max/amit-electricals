import Link from "next/link";
import { db } from "@/lib/db";
import MessageCard from "@/components/admin/MessageCard";

const TOPICS = ["general", "dealer", "gifting"] as const;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const topic = one(sp.topic);

  const messages = await db.message.findMany({
    where: topic ? { topic } : undefined,
    orderBy: { receivedAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-5 lg:p-8">
      <p className="eyebrow">Inbox</p>
      <h1 className="mt-1.5 text-[24px] lg:text-[28px]">Messages</h1>

      <div className="mt-5 flex gap-1.5">
        <Link
          href="/admin/messages"
          className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ${
            !topic ? "border-ink bg-ink text-white" : "border-line-2 text-ink-2"
          }`}
        >
          All
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t}
            href={`/admin/messages?topic=${t}`}
            className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold capitalize ${
              topic === t ? "border-ink bg-ink text-white" : "border-line-2 text-ink-2"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {messages.length === 0 ? (
          <p className="card p-8 text-center text-[13.5px] text-slate-soft">No messages here.</p>
        ) : (
          messages.map((m) => (
            <MessageCard
              key={m.id}
              message={{ ...m, receivedAt: m.receivedAt.toISOString() }}
            />
          ))
        )}
      </div>
    </div>
  );
}
