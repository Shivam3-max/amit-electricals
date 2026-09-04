"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDealer } from "./DealerProvider";

const initial = {
  company: "",
  contact: "",
  phone: "",
  password: "",
  email: "",
  gstin: "",
  city: "",
  address: "",
};

export default function RegisterForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { refresh } = useDealer();
  const router = useRouter();

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch("/api/dealer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Could not register. Please try again." });
        return;
      }
      await refresh();
      router.push("/account");
    } catch {
      setErrors({ form: "Could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 lg:p-6">
      {errors.form && (
        <p className="rounded-lg bg-copper-soft px-3 py-2 text-[12.5px] text-copper">{errors.form}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block">
          <span className="text-[12.5px] font-medium">Firm name</span>
          <input {...field("company")} required className="field mt-1.5" placeholder="Your firm" />
          {errors.company && <p className="mt-1 text-[11.5px] text-copper">{errors.company}</p>}
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">Your name</span>
          <input {...field("contact")} required className="field mt-1.5" placeholder="Contact person" />
          {errors.contact && <p className="mt-1 text-[11.5px] text-copper">{errors.contact}</p>}
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">Phone</span>
          <input
            {...field("phone")}
            required
            inputMode="tel"
            autoComplete="tel"
            className="field mt-1.5"
            placeholder="99150 33360"
          />
          {errors.phone && <p className="mt-1 text-[11.5px] text-copper">{errors.phone}</p>}
        </label>
        <label className="col-span-2 block">
          <span className="text-[12.5px] font-medium">Password</span>
          <input
            {...field("password")}
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="field mt-1.5"
            placeholder="At least 6 characters"
          />
          {errors.password && <p className="mt-1 text-[11.5px] text-copper">{errors.password}</p>}
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">Email (optional)</span>
          <input {...field("email")} type="email" className="field mt-1.5" placeholder="you@firm.com" />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">GSTIN (optional)</span>
          <input {...field("gstin")} className="field mt-1.5" placeholder="For B2B invoicing" />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">City</span>
          <input {...field("city")} className="field mt-1.5" placeholder="Panchkula" />
        </label>
        <label className="col-span-2 block sm:col-span-1">
          <span className="text-[12.5px] font-medium">Delivery address (optional)</span>
          <input {...field("address")} className="field mt-1.5" placeholder="Site or firm address" />
        </label>
      </div>

      <button type="submit" disabled={busy} className="btn btn-copper w-full">
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-[12.5px] text-slate-soft">
        Already registered?{" "}
        <Link href="/account/login" className="font-semibold text-copper hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
