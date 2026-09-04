"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Compare tray: a small list of product codes kept in localStorage.
 *
 * It deliberately avoids a React context — the tray is read in a handful of
 * unrelated places, so a storage-backed store with a broadcast event keeps
 * every consumer in sync without threading a provider through the tree.
 */

const KEY = "amit-electricals:compare:v1";
const EVENT = "amit-compare-change";
export const COMPARE_MAX = 4;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(codes: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(codes));
  } catch {
    /* storage unavailable — the tray simply won't persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useCompare() {
  const [codes, setCodes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCodes(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((code: string) => {
    const current = read();
    write(
      current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code].slice(-COMPARE_MAX),
    );
  }, []);

  const remove = useCallback((code: string) => write(read().filter((c) => c !== code)), []);
  const clear = useCallback(() => write([]), []);

  return { codes, ready, toggle, remove, clear, full: codes.length >= COMPARE_MAX };
}
