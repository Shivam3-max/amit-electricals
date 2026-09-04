"use client";

import { useState } from "react";

const STATUSES = ["NEW", "READ", "RESPONDED", "ARCHIVED"] as const;
const TONE: Record<string, string> = {
  NEW: "border-copper/40 text-copper",
  READ: "border-line-2 text-ink-3",
  RESPONDED: "border-ok/40 text-ok",
  ARCHIVED: "border-line-2 text-slate-soft",
};
const TOPIC_LABEL: Record<string, string> = { general: "General", dealer: "Dealer enquiry", gifting: "Gifting" };

export default function MessageCard({
  message,
}: {
  message: {
    id: string;
    ref: string;
    topic: string;
    name: string;
    phone: string;
    email: string | null;
    company: string | null;
    city: string | null;
    message: string;
    status: string;
    receivedAt: string;
  };
}) {
  const [status, setStatus] = useState(message.status);
  const [saving, setSaving] = useState(false);

  const setNewStatus = async (next: string) => {
    setStatus(next);
    setSaving(true);
    try {
      await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`card p-4 ${status === "ARCHIVED" ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-mist px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-ink-3">
              {TOPIC_LABEL[message.topic] ?? message.topic}
            </span>
            <span className="font-semibold">{message.name}</span>
            {message.company && <span className="text-[12.5px] text-slate-soft">· {message.company}</span>}
          </p>
          <p className="mt-0.5 text-[12px] text-slate-soft">
            {message.phone}
            {message.email ? ` · ${message.email}` : ""}
            {message.city ? ` · ${message.city}` : ""} ·{" "}
            {new Date(message.receivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setNewStatus(e.target.value)}
          disabled={saving}
          className={`h-8 shrink-0 rounded-md border bg-paper px-2 text-[12px] font-medium ${TONE[status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0] + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{message.message}</p>
      <div className="mt-3 flex gap-2">
        <a href={`tel:+91${message.phone.replace(/\D/g, "").slice(-10)}`} className="btn btn-sm btn-line">
          Call
        </a>
        <a
          href={`https://wa.me/91${message.phone.replace(/\D/g, "").slice(-10)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-line"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
