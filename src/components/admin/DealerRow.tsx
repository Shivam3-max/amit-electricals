"use client";

import { useState } from "react";
import Link from "next/link";

const TIERS = ["RETAILER", "DEALER", "PROJECT"] as const;
const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

const STATUS_TONE: Record<string, string> = {
  PENDING: "border-copper/40 text-copper",
  APPROVED: "border-ok/40 text-ok",
  REJECTED: "border-line-2 text-slate-soft",
};

export default function DealerRow({
  dealer,
}: {
  dealer: {
    id: string;
    company: string;
    contact: string;
    phone: string;
    city: string | null;
    tier: string;
    status: string;
    enquiryCount: number;
    createdAt: string;
  };
}) {
  const [tier, setTier] = useState(dealer.tier);
  const [status, setStatus] = useState(dealer.status);
  const [saving, setSaving] = useState(false);

  const patch = async (data: Record<string, string>) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/dealers/${dealer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-line last:border-0 hover:bg-mist">
      <td className="px-4 py-3">
        <Link href={`/admin/dealers/${dealer.id}`} className="font-medium text-copper hover:underline">
          {dealer.company}
        </Link>
        <p className="text-[11.5px] text-slate-soft">{dealer.contact}</p>
      </td>
      <td className="px-4 py-3 text-ink-2">{dealer.phone}</td>
      <td className="px-4 py-3 text-ink-2">{dealer.city || "—"}</td>
      <td className="px-4 py-3 text-center text-ink-2">{dealer.enquiryCount}</td>
      <td className="px-4 py-3">
        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            patch({ tier: e.target.value });
          }}
          disabled={saving}
          className="field h-8 w-28 px-2 text-[12px]"
        >
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t[0] + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            patch({ status: e.target.value });
          }}
          disabled={saving}
          className={`h-8 w-28 rounded-md border bg-paper px-2 text-[12px] font-medium ${STATUS_TONE[status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0] + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
