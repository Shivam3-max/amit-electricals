"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not sign in.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo onDark />
        </div>
        <form onSubmit={submit} className="rounded-card border border-white/10 bg-ink-2 p-6">
          <p className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/45">
            Staff only
          </p>
          <h1 className="mt-1.5 text-[20px] text-white">Admin sign in</h1>

          {error && (
            <p className="mt-4 rounded-lg bg-copper/15 px-3 py-2 text-[12.5px] text-copper-2">{error}</p>
          )}

          <label className="mt-5 block">
            <span className="text-[12.5px] font-medium text-white/70">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoFocus
              className="field mt-1.5 border-white/15 bg-ink text-white placeholder:text-white/30"
              placeholder="Counter password"
            />
          </label>

          <button type="submit" disabled={busy} className="btn bg-volt text-ink hover:bg-white mt-5 w-full">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-center text-[12px] text-white/35">
          Not staff? <a href="/" className="underline hover:text-white/60">Back to the storefront</a>
        </p>
      </div>
    </div>
  );
}
