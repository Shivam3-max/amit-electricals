"use client";

/**
 * Enquiry baskets.
 *
 * A trade buyer usually runs several sites at once, so the basket is plural:
 * named lists, one active at a time, all persisted locally. Nothing here talks
 * to money — submitting a list posts an enquiry for the counter team to price.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BasketLine } from "@/lib/types";

export type Basket = { id: string; name: string; lines: BasketLine[]; created: number };

type State = { baskets: Basket[]; activeId: string };

type Ctx = {
  ready: boolean;
  baskets: Basket[];
  active: Basket;
  activeId: string;
  count: number;
  units: number;
  add: (line: Omit<BasketLine, "qty"> & { qty?: number }) => void;
  addMany: (lines: (Omit<BasketLine, "qty"> & { qty?: number })[]) => void;
  setQty: (code: string, variant: string | null, qty: number) => void;
  setUom: (code: string, variant: string | null, uom: "pcs" | "box") => void;
  setNote: (code: string, variant: string | null, note: string) => void;
  remove: (code: string, variant: string | null) => void;
  clear: () => void;
  has: (code: string, variant?: string | null) => boolean;
  createBasket: (name: string) => void;
  renameBasket: (id: string, name: string) => void;
  deleteBasket: (id: string) => void;
  selectBasket: (id: string) => void;
};

const KEY = "amit-electricals:baskets:v1";
const newId = () => Math.random().toString(36).slice(2, 9);
const blank = (name = "Main list"): Basket => ({
  id: newId(),
  name,
  lines: [],
  created: Date.now(),
});

const BasketCtx = createContext<Ctx | null>(null);

const sameLine = (l: BasketLine, code: string, variant: string | null) =>
  l.code === code && (l.variant ?? null) === (variant ?? null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    const b = blank();
    return { baskets: [b], activeId: b.id };
  });
  const [ready, setReady] = useState(false);

  // Hydrate after mount so the server and first client render agree.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (parsed?.baskets?.length) {
          const activeId = parsed.baskets.some((b) => b.id === parsed.activeId)
            ? parsed.activeId
            : parsed.baskets[0].id;
          setState({ baskets: parsed.baskets, activeId });
        }
      }
    } catch {
      /* corrupt or unavailable storage — start clean */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota — the session still works, it just won't persist */
    }
  }, [state, ready]);

  const editActive = useCallback((fn: (lines: BasketLine[]) => BasketLine[]) => {
    setState((s) => ({
      ...s,
      baskets: s.baskets.map((b) => (b.id === s.activeId ? { ...b, lines: fn(b.lines) } : b)),
    }));
  }, []);

  const mergeLine = (
    lines: BasketLine[],
    input: Omit<BasketLine, "qty"> & { qty?: number },
  ) => {
    const qty = Math.max(1, Math.round(input.qty ?? 1));
    const i = lines.findIndex((l) => sameLine(l, input.code, input.variant ?? null));
    if (i === -1) return [...lines, { ...input, qty, variant: input.variant ?? null }];
    const next = [...lines];
    next[i] = { ...next[i], qty: next[i].qty + qty };
    return next;
  };

  const add: Ctx["add"] = useCallback(
    (line) => editActive((lines) => mergeLine(lines, line)),
    [editActive],
  );

  const addMany: Ctx["addMany"] = useCallback(
    (incoming) => editActive((lines) => incoming.reduce(mergeLine, lines)),
    [editActive],
  );

  const patch = useCallback(
    (code: string, variant: string | null, p: Partial<BasketLine>) =>
      editActive((lines) => lines.map((l) => (sameLine(l, code, variant) ? { ...l, ...p } : l))),
    [editActive],
  );

  const value = useMemo<Ctx>(() => {
    const active = state.baskets.find((b) => b.id === state.activeId) ?? state.baskets[0];
    return {
      ready,
      baskets: state.baskets,
      active,
      activeId: state.activeId,
      count: active.lines.length,
      units: active.lines.reduce(
        (n, l) => n + l.qty * (l.uom === "box" && l.boxQty ? l.boxQty : 1),
        0,
      ),
      add,
      addMany,
      setQty: (code, variant, qty) => patch(code, variant, { qty: Math.max(1, Math.round(qty)) }),
      setUom: (code, variant, uom) => patch(code, variant, { uom }),
      setNote: (code, variant, note) => patch(code, variant, { note }),
      remove: (code, variant) =>
        editActive((lines) => lines.filter((l) => !sameLine(l, code, variant))),
      clear: () => editActive(() => []),
      has: (code, variant) =>
        variant === undefined
          ? active.lines.some((l) => l.code === code)
          : active.lines.some((l) => sameLine(l, code, variant ?? null)),
      createBasket: (name) =>
        setState((s) => {
          const b = blank(name.trim() || `List ${s.baskets.length + 1}`);
          return { baskets: [...s.baskets, b], activeId: b.id };
        }),
      renameBasket: (id, name) =>
        setState((s) => ({
          ...s,
          baskets: s.baskets.map((b) => (b.id === id ? { ...b, name: name.trim() || b.name } : b)),
        })),
      deleteBasket: (id) =>
        setState((s) => {
          const left = s.baskets.filter((b) => b.id !== id);
          const baskets = left.length ? left : [blank()];
          return { baskets, activeId: baskets.some((b) => b.id === s.activeId) ? s.activeId : baskets[0].id };
        }),
      selectBasket: (id) => setState((s) => ({ ...s, activeId: id })),
    };
  }, [state, ready, add, addMany, patch, editActive]);

  return <BasketCtx.Provider value={value}>{children}</BasketCtx.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketCtx);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}
