"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import ProductImage from "./ProductImage";

/**
 * Main photo + thumbnail strip for the product page. Falls back to the usual
 * placeholder glyph when a product has no ingested photography yet — the
 * thumbnail strip simply doesn't render for a single (or zero) image product.
 */
export default function ProductGallery({
  images,
  name,
  category,
  overlay,
}: {
  images: string[];
  name: string;
  category: string;
  /** Badges (stock, compare toggle) painted over the main image. */
  overlay?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, Math.max(0, images.length - 1))] ?? null;

  return (
    <div>
      <div className="relative aspect-square max-w-[520px] overflow-hidden rounded-card border border-line bg-mist">
        <ProductImage name={name} category={category} src={current} detail priority sizes="(min-width: 1024px) 520px, 90vw" />
        {overlay}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex max-w-[520px] gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-paper transition-colors ${
                i === active ? "border-copper" : "border-line hover:border-line-2"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
