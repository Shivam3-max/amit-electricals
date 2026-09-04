"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDealer } from "./DealerProvider";

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useDealer();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dealer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      await refresh();
      router.push("/account");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 lg:p-6">
      {error && <p className="rounded-lg bg-copper-soft px-3 py-2 text-[12.5px] text-copper">{error}</p>}
      <label className="block">
        <span className="text-[12.5px] font-medium">Phone</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          autoComplete="tel"
          className="field mt-1.5"
          placeholder="99150 33360"
        />
      </label>
      <label className="block">
        <span className="text-[12.5px] font-medium">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
          className="field mt-1.5"
          placeholder="Your password"
        />
      </label>
      <button type="submit" disabled={busy} className="btn btn-ink w-full">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-[12.5px] text-slate-soft">
        New here?{" "}
        <Link href="/account/register" className="font-semibold text-copper hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
