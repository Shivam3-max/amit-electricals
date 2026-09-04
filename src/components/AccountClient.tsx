"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDealer } from "./DealerProvider";

const TIER_LABEL: Record<string, string> = {
  RETAILER: "Retailer",
  DEALER: "Dealer",
  PROJECT: "Project / Contractor",
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending approval", cls: "bg-copper-soft text-copper" },
  APPROVED: { label: "Approved", cls: "bg-ok-soft text-ok" },
  REJECTED: { label: "Not approved", cls: "bg-mist text-slate-soft" },
};

type EnquiryLine = { id: string; code: string; name: string; qty: number; uom: string };
type EnquirySummary = {
  id: string;
  ref: string;
  receivedAt: string;
  status: string;
  listName: string | null;
  purpose: string;
  lines: EnquiryLine[];
};

export default function AccountClient() {
  const { dealer, ready, logout } = useDealer();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquirySummary[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ company: "", contact: "", email: "", gstin: "", city: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !dealer) router.replace("/account/login");
  }, [ready, dealer, router]);

  useEffect(() => {
    if (dealer) {
      setForm({
        company: dealer.company,
        contact: dealer.contact,
        email: dealer.email ?? "",
        gstin: dealer.gstin ?? "",
        city: dealer.city ?? "",
        address: dealer.address ?? "",
      });
    }
  }, [dealer]);

  useEffect(() => {
    if (!dealer) return;
    fetch("/api/dealer/enquiries")
      .then((r) => r.json())
      .then((d) => setEnquiries(d.enquiries ?? []))
      .catch(() => setEnquiries([]));
  }, [dealer]);

  if (!ready || !dealer) {
    return (
      <div className="shell py-16 text-center text-[13.5px] text-slate-soft">Loading your account…</div>
    );
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/dealer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setSaveMsg("Could not save — check the fields and try again.");
        return;
      }
      setSaveMsg("Saved. Future enquiries will use these details.");
      setEditing(false);
    } catch {
      setSaveMsg("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const status = STATUS_LABEL[dealer.status];

  return (
    <div className="shell py-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Trade account</p>
          <h1 className="mt-1.5 text-[24px] sm:text-[28px] lg:text-[32px]">{dealer.company}</h1>
        </div>
        <button type="button" onClick={() => logout().then(() => router.push("/"))} className="btn btn-sm btn-line">
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div>
          <p className="eyebrow mb-3">Your order history</p>
          {enquiries === null ? (
            <p className="text-[13px] text-slate-soft">Loading…</p>
          ) : enquiries.length === 0 ? (
            <div className="card px-6 py-12 text-center">
              <p className="font-display text-[17px] font-bold">No enquiries yet</p>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
                Build a list on the order pad and submit it — it will show up here, and next time
                your details are already filled in.
              </p>
              <Link href="/order-pad" className="btn btn-ink mt-5">
                Open the order pad
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-line overflow-hidden">
              {enquiries.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="code-chip">{e.ref}</span>
                    <span className="rounded bg-mist px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
                      {e.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] text-ink-2">
                    {e.listName || "Enquiry"} · {e.lines.length} line{e.lines.length === 1 ? "" : "s"} ·{" "}
                    {new Date(e.receivedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-1 truncate text-[11.5px] text-slate-soft">
                    {e.lines.slice(0, 4).map((l) => l.name).join(", ")}
                    {e.lines.length > 4 ? ` +${e.lines.length - 4} more` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-[100px] lg:self-start">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">Profile</p>
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${status.cls}`}>
                {status.label}
              </span>
            </div>

            {!editing ? (
              <div className="space-y-2.5 text-[13px]">
                <Row label="Firm" value={dealer.company} />
                <Row label="Contact" value={dealer.contact} />
                <Row label="Phone" value={dealer.phone} />
                <Row label="Email" value={dealer.email || "—"} />
                <Row label="GSTIN" value={dealer.gstin || "—"} />
                <Row label="City" value={dealer.city || "—"} />
                <Row label="Address" value={dealer.address || "—"} />
                <Row label="Rate tier" value={TIER_LABEL[dealer.tier]} />
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn btn-sm btn-line mt-3 w-full"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-3">
                <Field label="Firm name" input={field("company")} required />
                <Field label="Contact name" input={field("contact")} required />
                <Field label="Email" input={field("email")} type="email" />
                <Field label="GSTIN" input={field("gstin")} />
                <Field label="City" input={field("city")} />
                <Field label="Address" input={field("address")} />
                {saveMsg && <p className="text-[12px] text-ink-3">{saveMsg}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="btn btn-sm btn-copper flex-1">
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn btn-sm btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="mt-4 text-[11.5px] leading-relaxed text-slate-soft">
            Your account is live — order straight away. The counter can adjust your rate tier as
            your volume grows; it decides the pricing applied when your enquiries are quoted.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
      <span className="text-slate-soft">{label}</span>
      <span className="truncate text-right font-medium text-ink-2">{value}</span>
    </div>
  );
}

function Field({
  label,
  input,
  required,
  type = "text",
}: {
  label: string;
  input: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void };
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}</span>
      <input {...input} type={type} required={required} className="field mt-1 h-9 text-[13px]" />
    </label>
  );
}
