import "server-only";

import { db } from "./db";

/**
 * Homepage/gifting content that used to be hardcoded in the page files.
 * Each getter seeds the database with the content that was actually live
 * on the site the first time it's called, so the admin (and the storefront,
 * before anyone has opened the admin) always show real data, never a blank
 * slate — and the admin edits from there.
 */

export const DEFAULT_GIFT_BANDS = [
  {
    range: "Under ₹500",
    note: "Small but genuinely useful — the ones nobody re-gifts.",
    codes: ["SUR-315FCB", "SUR-AA0241", "SUR-B4FA52"],
  },
  {
    range: "₹500 – ₹1,000",
    note: "Desk and home essentials for a wider round.",
    codes: ["SUR-D4E3E5", "SUR-84241D", "SUR-5ABD93"],
  },
  {
    range: "₹1,000 – ₹2,500",
    note: "The tier people remember you for.",
    codes: ["SUR-3412F9", "HH-1205", "IMAGINA-1.5"],
  },
  {
    range: "₹2,500 and above",
    note: "Leadership gifting and top-tier channel partners.",
    codes: ["HWHSVPB062P", "ZOLTA"],
  },
];

export const DEFAULT_FAQ = [
  {
    q: "Why can't I see prices on the site?",
    a: "Trade rates depend on your firm, volume and rate contract, so a published price would be wrong for almost everyone. Build the list, send it, and you get the rates that actually apply to you — usually within the same working day.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Build a list and submit it with your firm name, GSTIN and a phone number. Registering once means your details fill in automatically next time.",
  },
  {
    q: "Is there a minimum order?",
    a: "For delivery inside the city there is no minimum on stocked lines. Indent items and outstation dispatch have a minimum that the counter confirms on your proforma.",
  },
  {
    q: "What if an item is out of stock?",
    a: "Lines marked Indent are not on the floor today. We quote them with a lead time so you can decide whether to wait, split the delivery, or take an equivalent from another brand.",
  },
  {
    q: "Can you match a competitor's specification?",
    a: "Usually yes. Send the spec or the make and model you have been given, and we will come back with the closest equivalents across Surya, Polycab, Halonix and Indo.",
  },
];

/**
 * `skipDuplicates` on createMany isn't supported on SQLite, so the race-
 * safety here comes from the `range`/`q` unique constraints plus catching
 * the resulting P2002 — two concurrent first-loads can both see `count === 0`
 * and both attempt the insert, but only one succeeds; the other's unique-
 * constraint failure is swallowed since the rows it wanted are already there.
 * Any other error still throws.
 */
function isUniqueConstraintError(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

export async function getGiftBands() {
  const count = await db.giftBand.count();
  if (count === 0) {
    try {
      await db.giftBand.createMany({
        data: DEFAULT_GIFT_BANDS.map((d, i) => ({
          range: d.range,
          note: d.note,
          codesJson: JSON.stringify(d.codes),
          order: i,
        })),
      });
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
    }
  }
  const rows = await db.giftBand.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ ...r, codes: JSON.parse(r.codesJson) as string[] }));
}

export async function getFaqs() {
  const count = await db.faqEntry.count();
  if (count === 0) {
    try {
      await db.faqEntry.createMany({ data: DEFAULT_FAQ.map((d, i) => ({ ...d, order: i })) });
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
    }
  }
  return db.faqEntry.findMany({ orderBy: { order: "asc" } });
}
