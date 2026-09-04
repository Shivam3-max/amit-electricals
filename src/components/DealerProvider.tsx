"use client";

/**
 * Signed-in dealer state, available anywhere in the tree. Reads
 * /api/dealer/me once on mount (the session lives in an httpOnly cookie, so
 * this is the only way client code can know who — if anyone — is signed in).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Dealer } from "@/lib/types";

type Ctx = {
  dealer: Dealer | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const DealerCtx = createContext<Ctx | null>(null);

export function DealerProvider({ children }: { children: ReactNode }) {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dealer/me", { cache: "no-store" });
      const data = (await res.json()) as { dealer: Dealer | null };
      setDealer(data.dealer);
    } catch {
      setDealer(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/dealer/logout", { method: "POST" });
    setDealer(null);
  }, []);

  return (
    <DealerCtx.Provider value={{ dealer, ready, refresh, logout }}>{children}</DealerCtx.Provider>
  );
}

export function useDealer() {
  const ctx = useContext(DealerCtx);
  if (!ctx) throw new Error("useDealer must be used inside <DealerProvider>");
  return ctx;
}
