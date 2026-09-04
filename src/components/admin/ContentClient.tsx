"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BannerRow = { slot: number; image: string; link: string; label: string; active: boolean };
type DeptTile = { slug: string; label: string; image: string; active: boolean };
type Band = { id: string; range: string; note: string; codes: string[] };
type Faq = { id: string; q: string; a: string };

const SLOTS = [1, 2, 3];

export default function ContentClient() {
  const [banners, setBanners] = useState<Record<number, BannerRow>>({});
  const [deptTiles, setDeptTiles] = useState<DeptTile[] | null>(null);
  const [bands, setBands] = useState<Band[] | null>(null);
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    fetch("/api/admin/content/banners")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.banners ?? []) as BannerRow[];
        setBanners(Object.fromEntries(rows.map((b) => [b.slot, { ...b, link: b.link ?? "", label: b.label ?? "" }])));
      });
    fetch("/api/admin/content/dept-banners")
      .then((r) => r.json())
      .then((d) => setDeptTiles(d.tiles ?? []));
    fetch("/api/admin/content/bands")
      .then((r) => r.json())
      .then((d) => setBands(d.bands ?? []));
    fetch("/api/admin/content/faq")
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs ?? []));
  }, []);

  const bannerFor = (slot: number): BannerRow =>
    banners[slot] ?? { slot, image: "", link: "", label: "", active: true };

  const setBanner = (slot: number, patch: Partial<BannerRow>) =>
    setBanners((b) => ({ ...b, [slot]: { ...bannerFor(slot), ...patch } }));

  const uploadBanner = async (slot: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("brand", "banners");
    form.append("code", `slot-${slot}`);
    const res = await fetch("/api/admin/catalog/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) setBanner(slot, { image: data.path });
  };

  const saveBanner = async (slot: number) => {
    const b = bannerFor(slot);
    await fetch(`/api/admin/content/banners/${slot}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    flash(`Banner ${slot} saved`);
  };

  const clearBanner = async (slot: number) => {
    await fetch(`/api/admin/content/banners/${slot}`, { method: "DELETE" });
    setBanner(slot, { image: "", link: "", label: "", active: true });
    flash(`Banner ${slot} cleared`);
  };

  const setDeptTile = (slug: string, patch: Partial<DeptTile>) =>
    setDeptTiles((rows) => (rows ? rows.map((r) => (r.slug === slug ? { ...r, ...patch } : r)) : rows));

  const uploadDeptTile = async (slug: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("brand", "dept-banners");
    form.append("code", slug);
    const res = await fetch("/api/admin/catalog/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) setDeptTile(slug, { image: data.path });
  };

  const saveDeptTile = async (slug: string) => {
    const t = deptTiles?.find((r) => r.slug === slug);
    if (!t || !t.image) return;
    await fetch(`/api/admin/content/dept-banners/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: t.image, active: t.active }),
    });
    flash(`${t.label} tile saved`);
  };

  const clearDeptTile = async (slug: string) => {
    await fetch(`/api/admin/content/dept-banners/${slug}`, { method: "DELETE" });
    setDeptTile(slug, { image: "", active: true });
    flash("Reverted to the gradient tile");
  };

  const updateBand = async (id: string, patch: Partial<Band>) => {
    setBands((rows) => (rows ? rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) : rows));
    await fetch(`/api/admin/content/bands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const addBand = async () => {
    const res = await fetch("/api/admin/content/bands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ range: "New band", note: "" }),
    });
    const data = await res.json();
    setBands((rows) => [...(rows ?? []), data.band]);
  };

  const removeBand = async (id: string) => {
    setBands((rows) => rows?.filter((r) => r.id !== id) ?? rows);
    await fetch(`/api/admin/content/bands/${id}`, { method: "DELETE" });
  };

  const updateFaq = async (id: string, patch: Partial<Faq>) => {
    setFaqs((rows) => (rows ? rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) : rows));
    await fetch(`/api/admin/content/faq/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const addFaq = async () => {
    const res = await fetch("/api/admin/content/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: "New question", a: "Answer" }),
    });
    const data = await res.json();
    setFaqs((rows) => [...(rows ?? []), data.faq]);
  };

  const removeFaq = async (id: string) => {
    setFaqs((rows) => rows?.filter((r) => r.id !== id) ?? rows);
    await fetch(`/api/admin/content/faq/${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-10">
      {toast && (
        <p className="fixed right-5 top-5 z-50 rounded-lg bg-ok-soft px-4 py-2 text-[12.5px] font-medium text-ok shadow-pop">
          {toast}
        </p>
      )}

      {/* ---- Hero banners ---- */}
      <section>
        <p className="eyebrow mb-1">Homepage hero</p>
        <h2 className="text-[18px]">Banner slots</h2>
        <p className="mt-1 text-[13px] text-slate-soft">Fills the three rotating slots on the home page carousel.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SLOTS.map((slot) => {
            const b = bannerFor(slot);
            return (
              <div key={slot} className="card p-4">
                <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-soft">
                  Slot {slot}
                </p>
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg border border-line bg-mist">
                  {b.image ? (
                    <Image src={b.image} alt="" fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[11px] text-slate-soft">
                      No image yet
                    </div>
                  )}
                </div>
                <label className="btn btn-sm btn-line block w-full cursor-pointer text-center">
                  {b.image ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadBanner(slot, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <input
                  value={b.link}
                  onChange={(e) => setBanner(slot, { link: e.target.value })}
                  placeholder="Link (e.g. /catalog/lighting)"
                  className="field mt-2 h-9 text-[12.5px]"
                />
                <label className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-2">
                  <input
                    type="checkbox"
                    checked={b.active}
                    onChange={(e) => setBanner(slot, { active: e.target.checked })}
                    className="size-4 accent-ink"
                  />
                  Active
                </label>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => saveBanner(slot)} className="btn btn-sm btn-copper flex-1">
                    Save
                  </button>
                  {b.image && (
                    <button type="button" onClick={() => clearBanner(slot)} className="btn btn-sm btn-ghost">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Department tiles ---- */}
      <section>
        <p className="eyebrow mb-1">Homepage · Shop by department</p>
        <h2 className="text-[18px]">Department tiles</h2>
        <p className="mt-1 text-[13px] text-slate-soft">
          A photo replaces the gradient card for that department — the link, position and layout
          never change. Leave a tile blank to keep the gradient. &ldquo;Wires &amp; Cables&rdquo; is
          the wide featured tile (2400×1000px, landscape); the other six are square (1200×1200px).
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {deptTiles === null ? (
            <p className="text-[13px] text-slate-soft">Loading…</p>
          ) : (
            deptTiles.map((t, i) => (
              <div key={t.slug} className="card p-4">
                <p className="mb-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate-soft">
                  <span>{t.label}</span>
                  <span className="text-line-2">/catalog/{t.slug}</span>
                </p>
                <div
                  className={`relative mb-3 overflow-hidden rounded-lg border border-line bg-mist ${
                    i === 0 ? "aspect-[12/5]" : "aspect-square"
                  }`}
                >
                  {t.image ? (
                    <Image src={t.image} alt="" fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-[11px] text-slate-soft">
                      Gradient tile (no photo yet)
                    </div>
                  )}
                </div>
                <label className="btn btn-sm btn-line block w-full cursor-pointer text-center">
                  {t.image ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadDeptTile(t.slug, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <label className="mt-2 flex items-center gap-2 text-[12.5px] text-ink-2">
                  <input
                    type="checkbox"
                    checked={t.active}
                    onChange={(e) => setDeptTile(t.slug, { active: e.target.checked })}
                    className="size-4 accent-ink"
                  />
                  Active
                </label>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveDeptTile(t.slug)}
                    disabled={!t.image}
                    className="btn btn-sm btn-copper flex-1 disabled:opacity-40"
                  >
                    Save
                  </button>
                  {t.image && (
                    <button type="button" onClick={() => clearDeptTile(t.slug)} className="btn btn-sm btn-ghost">
                      Revert
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---- Gifting bands ---- */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Corporate gifting</p>
            <h2 className="text-[18px]">Budget bands</h2>
          </div>
          <button type="button" onClick={addBand} className="btn btn-sm btn-line">
            + Add band
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {bands === null ? (
            <p className="text-[13px] text-slate-soft">Loading…</p>
          ) : (
            bands.map((band) => (
              <div key={band.id} className="card grid gap-3 p-4 sm:grid-cols-[1fr_2fr_2fr_auto]">
                <input
                  value={band.range}
                  onChange={(e) => updateBand(band.id, { range: e.target.value })}
                  className="field h-9 text-[13px]"
                  placeholder="Under ₹500"
                />
                <input
                  value={band.note}
                  onChange={(e) => updateBand(band.id, { note: e.target.value })}
                  className="field h-9 text-[13px]"
                  placeholder="Short description"
                />
                <input
                  defaultValue={band.codes.join(", ")}
                  onBlur={(e) =>
                    updateBand(band.id, {
                      codes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="field h-9 text-[13px]"
                  placeholder="Catalogue codes, comma separated"
                />
                <button
                  type="button"
                  onClick={() => removeBand(band.id)}
                  aria-label="Remove band"
                  className="btn btn-ghost size-9 shrink-0 self-center rounded-lg p-0"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Homepage</p>
            <h2 className="text-[18px]">FAQ</h2>
          </div>
          <button type="button" onClick={addFaq} className="btn btn-sm btn-line">
            + Add question
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {faqs === null ? (
            <p className="text-[13px] text-slate-soft">Loading…</p>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="card space-y-2 p-4">
                <div className="flex gap-2">
                  <input
                    defaultValue={f.q}
                    onBlur={(e) => updateFaq(f.id, { q: e.target.value })}
                    className="field h-9 flex-1 text-[13px] font-medium"
                    placeholder="Question"
                  />
                  <button
                    type="button"
                    onClick={() => removeFaq(f.id)}
                    aria-label="Remove question"
                    className="btn btn-ghost size-9 shrink-0 rounded-lg p-0"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  defaultValue={f.a}
                  onBlur={(e) => updateFaq(f.id, { a: e.target.value })}
                  rows={2}
                  className="field h-auto py-2 text-[13px]"
                  placeholder="Answer"
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
