/** Minimal RFC-4180 CSV parser — quoted fields, escaped quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const CODE_HEADS = /^(code|sku|item ?code|catalogue ?code|part ?no\.?)$/i;
const QTY_HEADS = /^(qty|quantity|units|nos\.?|pcs)$/i;
const NAME_HEADS = /^(item|description|product|name|particulars)$/i;

/**
 * Turn a raw CSV grid into { term, qty } rows, tolerating both a proper
 * header row and a bare two-column "item, qty" list with no header at all.
 */
export function rowsFromCsv(grid: string[][]): { term: string; qty: number }[] {
  if (!grid.length) return [];

  const header = grid[0].map((h) => h.trim());
  let codeIdx = header.findIndex((h) => CODE_HEADS.test(h));
  let nameIdx = header.findIndex((h) => NAME_HEADS.test(h));
  let qtyIdx = header.findIndex((h) => QTY_HEADS.test(h));
  const hasHeader = codeIdx >= 0 || nameIdx >= 0 || qtyIdx >= 0;

  const body = hasHeader ? grid.slice(1) : grid;
  if (!hasHeader) {
    codeIdx = 0;
    qtyIdx = grid[0].length > 1 && /^\d+$/.test(grid[0][1]?.trim() ?? "") ? 1 : -1;
  }
  const termIdx = codeIdx >= 0 ? codeIdx : nameIdx;

  return body
    .map((r) => {
      const term = (termIdx! >= 0 ? r[termIdx!] : r[0])?.trim() ?? "";
      const qtyRaw = qtyIdx >= 0 ? r[qtyIdx] : undefined;
      const qty = Math.max(1, parseInt(String(qtyRaw ?? "1").replace(/[^\d]/g, ""), 10) || 1);
      return { term, qty };
    })
    .filter((r) => r.term);
}
