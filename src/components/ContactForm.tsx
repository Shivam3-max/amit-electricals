"use client";

import { useState } from "react";

export default function ContactForm({
  topic,
  messageLabel = "How can we help?",
  messagePlaceholder = "Tell us what you're looking for",
  submitLabel = "Send message",
}: {
  topic: "general" | "dealer" | "gifting";
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", city: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Something went wrong. Please try again." });
        return;
      }
      setRef(data.ref);
    } catch {
      setErrors({ form: "Could not reach the server. Please call the counter instead." });
    } finally {
      setBusy(false);
    }
  };

  if (ref) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ok-soft text-ok">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="mt-4 font-display text-[17px] font-bold">Message sent</p>
        <p className="mt-1.5 text-[13px] text-slate-soft">
          Reference <span className="code-chip text-ink">{ref}</span>. We usually reply within one
          working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 lg:p-6">
      {errors.form && (
        <p className="rounded-lg bg-copper-soft px-3 py-2 text-[12.5px] text-copper">{errors.form}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12.5px] font-medium">Your name</span>
          <input {...field("name")} required className="field mt-1.5" placeholder="Full name" />
          {errors.name && <p className="mt-1 text-[11.5px] text-copper">{errors.name}</p>}
        </label>
        <label className="block">
          <span className="text-[12.5px] font-medium">Phone</span>
          <input {...field("phone")} required inputMode="tel" className="field mt-1.5" placeholder="99150 33360" />
          {errors.phone && <p className="mt-1 text-[11.5px] text-copper">{errors.phone}</p>}
        </label>
        <label className="block">
          <span className="text-[12.5px] font-medium">Email (optional)</span>
          <input {...field("email")} type="email" className="field mt-1.5" placeholder="you@firm.com" />
        </label>
        <label className="block">
          <span className="text-[12.5px] font-medium">Firm / company</span>
          <input {...field("company")} className="field mt-1.5" placeholder="Optional" />
        </label>
        <label className="col-span-2 block">
          <span className="text-[12.5px] font-medium">City</span>
          <input {...field("city")} className="field mt-1.5" placeholder="Optional" />
        </label>
        <label className="col-span-2 block">
          <span className="text-[12.5px] font-medium">{messageLabel}</span>
          <textarea
            {...field("message")}
            required
            rows={4}
            className="field mt-1.5 h-auto py-2"
            placeholder={messagePlaceholder}
          />
          {errors.message && <p className="mt-1 text-[11.5px] text-copper">{errors.message}</p>}
        </label>
      </div>
      <button type="submit" disabled={busy} className="btn btn-copper w-full">
        {busy ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
