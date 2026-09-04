"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "DISPATCHED", "CLOSED", "CANCELLED"] as const;

type Line = {
  id: string;
  code: string;
  name: string;
  brand: string;
  variant: string | null;
  qty: number;
  uom: string;
  note: string | null;
  unitPrice: number | null;
};

type Note = { id: string; author: string; text: string; createdAt: string };

export default function EnquiryDetailClient({
  enquiryId,
  status: initialStatus,
  assignedTo: initialAssigned,
  lines,
  notes: initialNotes,
}: {
  enquiryId: string;
  status: string;
  assignedTo: string | null;
  lines: Line[];
  notes: Note[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [assignedTo, setAssignedTo] = useState(initialAssigned ?? "");
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(lines.map((l) => [l.id, l.unitPrice != null ? String(l.unitPrice) : ""])),
  );
  const [savingLine, setSavingLine] = useState<string | null>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const saveStatus = async (next: string) => {
    setStatus(next);
    setStatusSaving(true);
    try {
      await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
      flash("Status updated");
    } finally {
      setStatusSaving(false);
    }
  };

  const saveAssigned = async () => {
    await fetch(`/api/admin/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo }),
    });
    flash("Saved");
  };

  const saveLinePrice = async (lineId: string) => {
    setSavingLine(lineId);
    const raw = prices[lineId];
    const unitPrice = raw.trim() === "" ? null : Number(raw);
    try {
      await fetch(`/api/admin/enquiries/${enquiryId}/lines/${lineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitPrice }),
      });
      router.refresh();
    } finally {
      setSavingLine(null);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText }),
      });
      const data = await res.json();
      setNotes((n) => [...n, data.note]);
      setNoteText("");
    } finally {
      setAddingNote(false);
    }
  };

  const total = lines.reduce((sum, l) => {
    const p = Number(prices[l.id]);
    return sum + (Number.isFinite(p) ? p * l.qty : 0);
  }, 0);
  const pricedCount = lines.filter((l) => prices[l.id]?.trim()).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-mist px-4 py-3">
            <p className="text-[13px] font-semibold">
              {lines.length} line{lines.length === 1 ? "" : "s"} · {pricedCount} priced
            </p>
            <p className="font-mono text-[13px] font-semibold text-ink">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11.5px] text-slate-soft">
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Qty</th>
                  <th className="px-4 py-2 font-medium">Unit price</th>
                  <th className="px-4 py-2 font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const p = Number(prices[l.id]);
                  const lineTotal = Number.isFinite(p) && prices[l.id]?.trim() ? p * l.qty : null;
                  return (
                    <tr key={l.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{l.name}</p>
                        <p className="text-[11px] text-slate-soft">
                          <span className="code-chip">{l.code}</span> · {l.brand}
                          {l.variant ? ` · ${l.variant}` : ""}
                          {l.note ? ` · “${l.note}”` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">
                        {l.qty} {l.uom}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink-3">₹</span>
                          <input
                            value={prices[l.id]}
                            onChange={(e) =>
                              setPrices((p) => ({ ...p, [l.id]: e.target.value.replace(/[^\d.]/g, "") }))
                            }
                            onBlur={() => saveLinePrice(l.id)}
                            inputMode="decimal"
                            placeholder="—"
                            className="field h-8 w-20 px-2 text-[12.5px]"
                          />
                          {savingLine === l.id && <span className="text-[10.5px] text-slate-soft">saving…</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-ink-2">
                        {lineTotal != null ? `₹${lineTotal.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <p className="eyebrow mb-3">Internal notes</p>
          <div className="card p-4">
            {notes.length > 0 && (
              <ul className="mb-3 space-y-2.5 border-b border-line pb-3">
                {notes.map((n) => (
                  <li key={n.id} className="text-[12.5px]">
                    <span className="font-semibold text-ink-2">{n.author}</span>{" "}
                    <span className="text-slate-soft">
                      · {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <p className="mt-0.5 text-ink-3">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add a note for the team…"
                className="field h-9 flex-1 text-[13px]"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={addingNote || !noteText.trim()}
                className="btn btn-sm btn-line"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <p className="eyebrow mb-2">Status</p>
          <select
            value={status}
            onChange={(e) => saveStatus(e.target.value)}
            disabled={statusSaving}
            className="field h-10 pr-8"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0] + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-4">
          <p className="eyebrow mb-2">Assigned to</p>
          <div className="flex gap-2">
            <input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Staff name"
              className="field h-9 flex-1 text-[13px]"
            />
            <button type="button" onClick={saveAssigned} className="btn btn-sm btn-line">
              Save
            </button>
          </div>
        </div>

        {toast && (
          <p className="rounded-lg bg-ok-soft px-3 py-2 text-center text-[12.5px] font-medium text-ok">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
