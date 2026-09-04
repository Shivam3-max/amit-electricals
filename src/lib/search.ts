import { catalogIndex } from "./catalog";
import type { IndexRow } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Pre-normalised haystacks, built once per process. */
const HAY = catalogIndex.map((r) => ({
  row: r,
  code: r.c.toLowerCase(),
  text: norm(`${r.n} ${r.b} ${r.kl} ${r.w}`),
}));

/**
 * Scores rows against a free-text query. Trade buyers search by catalogue code
 * as often as by name, so an exact or prefix code hit always wins.
 */
export function search(query: string, opts: { dept?: string; brand?: string; limit?: number } = {}) {
  const { dept, brand, limit = 40 } = opts;
  const q = norm(query);
  const raw = query.trim().toLowerCase().replace(/\s+/g, "");
  if (!q) return [] as IndexRow[];
  const terms = q.split(" ").filter(Boolean);

  const out: [number, IndexRow][] = [];
  for (const h of HAY) {
    if (dept && h.row.d !== dept) continue;
    if (brand && h.row.b !== brand) continue;

    let score = 0;
    if (h.code === raw) score += 1000;
    else if (h.code.startsWith(raw) && raw.length >= 3) score += 400;
    else if (raw.length >= 4 && h.code.includes(raw)) score += 160;

    let matched = 0;
    for (const t of terms) {
      const at = h.text.indexOf(t);
      if (at === -1) continue;
      matched++;
      score += at === 0 ? 40 : h.text[at - 1] === " " ? 26 : 9;
    }
    if (matched < terms.length && score < 160) continue;
    if (!score) continue;

    // Prefer shorter names — they read as the canonical item, not a long variant.
    score -= Math.min(12, h.row.n.length / 22);
    out.push([score, h.row]);
  }

  return out
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, r]) => r);
}

/** Resolve pasted codes (order pad / spreadsheet upload) to catalogue rows. */
export function resolveCodes(codes: string[]) {
  const map = new Map(catalogIndex.map((r) => [r.c.toUpperCase(), r]));
  return codes.map((raw) => {
    const code = raw.trim().toUpperCase();
    const hit = map.get(code);
    if (hit) return { input: raw, row: hit, status: "ok" as const };
    // Fall back to a name search so a pasted description still lands somewhere.
    const guess = search(raw, { limit: 1 })[0];
    return guess
      ? { input: raw, row: guess, status: "guess" as const }
      : { input: raw, row: null, status: "missing" as const };
  });
}
