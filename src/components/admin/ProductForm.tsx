"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DEPTS = [
  ["wires-cables", "Wires & Cables"],
  ["lighting", "Lighting"],
  ["fans", "Fans"],
  ["switches", "Switches & Accessories"],
  ["switchgear", "Switchgear & Protection"],
  ["appliances", "Appliances & Water Heating"],
  ["solar", "Solar & Green Energy"],
] as const;

type Initial = {
  code: string;
  name: string;
  brand: string;
  dept: string;
  category: string;
  description: string;
  stock: "in-stock" | "indent";
  specs: Record<string, string>;
  images: string[];
  hasOverride: boolean;
};

export default function ProductForm({
  isNew,
  initial,
}: {
  isNew: boolean;
  initial: Initial;
}) {
  const router = useRouter();
  const [code, setCode] = useState(isNew ? "" : initial.code);
  const [name, setName] = useState(initial.name);
  const [brand, setBrand] = useState(initial.brand || "Rexsun");
  const [dept, setDept] = useState(initial.dept || "lighting");
  const [category, setCategory] = useState(initial.category);
  const [description, setDescription] = useState(initial.description);
  const [stock, setStock] = useState<"in-stock" | "indent">(initial.stock);
  const [specs, setSpecs] = useState(
    Object.entries(initial.specs).map(([k, v]) => ({ k, v })),
  );
  const [images, setImages] = useState(initial.images);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("brand", (brand || "misc").toLowerCase());
      form.append("code", (isNew ? name : initial.code) || "item");
      const res = await fetch("/api/admin/catalog/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setImages((imgs) => [...imgs, data.path]);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/catalog/products/${isNew ? "new" : initial.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: isNew ? code : undefined,
          name,
          brand,
          dept,
          category,
          categorySlug: category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          description,
          stock,
          specs: Object.fromEntries(specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v.trim()])),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      flash("Saved — catalogue rebuilt.");
      if (isNew) router.push(`/admin/catalog/${data.code}`);
      else router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const revert = async () => {
    if (!confirm("Revert to the original scraped data? Your edits here will be discarded.")) return;
    await fetch(`/api/admin/catalog/products/${initial.code}`, { method: "DELETE" });
    router.push("/admin/catalog");
  };

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {error && <p className="rounded-lg bg-copper-soft px-3 py-2 text-[12.5px] text-copper">{error}</p>}

        <div className="card space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="col-span-2 block">
              <span className="text-[12.5px] font-medium">Product name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="field mt-1.5"
                placeholder="e.g. Rexsun 20W LED Batten"
              />
            </label>
            {isNew && (
              <label className="block">
                <span className="text-[12.5px] font-medium">Catalogue code / SKU</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="field mt-1.5"
                  placeholder="Leave blank to auto-generate"
                />
              </label>
            )}
            <label className="block">
              <span className="text-[12.5px] font-medium">Brand</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="field mt-1.5" />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-medium">Department</span>
              <select value={dept} onChange={(e) => setDept(e.target.value)} className="field mt-1.5 pr-8">
                {DEPTS.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[12.5px] font-medium">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field mt-1.5"
                placeholder="e.g. LED Battens"
              />
            </label>
            <label className="col-span-2 block">
              <span className="text-[12.5px] font-medium">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="field mt-1.5 h-auto py-2"
              />
            </label>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Specifications</p>
            <button
              type="button"
              onClick={() => setSpecs((s) => [...s, { k: "", v: "" }])}
              className="text-[12.5px] font-semibold text-copper hover:underline"
            >
              + Add spec
            </button>
          </div>
          {specs.length === 0 ? (
            <p className="text-[13px] text-slate-soft">No specs yet.</p>
          ) : (
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.k}
                    onChange={(e) =>
                      setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))
                    }
                    placeholder="Label (e.g. Wattage)"
                    className="field h-9 flex-1 text-[13px]"
                  />
                  <input
                    value={s.v}
                    onChange={(e) =>
                      setSpecs((rows) => rows.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))
                    }
                    placeholder="Value (e.g. 20W)"
                    className="field h-9 flex-1 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs((rows) => rows.filter((_, j) => j !== i))}
                    aria-label="Remove spec"
                    className="btn btn-ghost size-9 shrink-0 rounded-lg p-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-4">
          <p className="eyebrow mb-3">Photos</p>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-mist">
                  <Image src={src} alt="" fill sizes="100px" className="object-contain" />
                  <button
                    type="button"
                    onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink/80 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="btn btn-sm btn-line block w-full cursor-pointer text-center">
            {uploading ? "Uploading…" : "+ Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
          <p className="mt-2 text-[11px] text-slate-soft">JPG, PNG or WebP, up to 8MB.</p>
        </div>

        <div className="card p-4">
          <p className="eyebrow mb-2">Stock</p>
          <select
            value={stock}
            onChange={(e) => setStock(e.target.value as "in-stock" | "indent")}
            className="field h-10 pr-8"
          >
            <option value="in-stock">In stock</option>
            <option value="indent">On indent</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="btn btn-copper w-full">
          {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </button>

        {!isNew && initial.hasOverride && (
          <button type="button" onClick={revert} className="btn btn-sm btn-ghost w-full text-copper">
            Revert to original scraped data
          </button>
        )}

        {toast && (
          <p className="rounded-lg bg-ok-soft px-3 py-2 text-center text-[12.5px] font-medium text-ok">
            {toast}
          </p>
        )}
      </div>
    </form>
  );
}
