"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Hero banner carousel.
 *
 * Each slide is a real, sized frame with autoplay, arrows, dots and keyboard
 * control already wired. A slot with no artwork uploaded yet in the admin
 * (Content → Banners) falls back to a dashed placeholder instead of showing
 * nothing, so the carousel never looks broken while waiting on artwork.
 */

export type BannerSlot = { id: number; note: string; image?: string; link?: string | null };

const DEFAULT_SLOTS: BannerSlot[] = [
  { id: 1, note: "Primary campaign" },
  { id: 2, note: "Brand or season" },
  { id: 3, note: "Offer or new range" },
];

const INTERVAL = 6000;

export default function HeroBanners({ slots = DEFAULT_SLOTS }: { slots?: BannerSlot[] }) {
  const SLOTS = slots.length ? slots : DEFAULT_SLOTS;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLOTS.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const step = (d: number) => setI((n) => (n + d + SLOTS.length) % SLOTS.length);

  return (
    <div
      ref={frame}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      className="group relative overflow-hidden rounded-card border border-line bg-mist"
    >
      {/*
        Each breakpoint gets its own crop, not a squeezed copy of the desktop
        banner: tall and portrait-leaning on a phone (screens are narrow but
        tall, so a shallow strip reads as empty), levelling out to a wide,
        cinematic strip once there's room for it on a laptop.
      */}
      <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9] lg:aspect-[21/7]">
        {SLOTS.map((s, n) => (
          <div
            key={s.id}
            aria-hidden={n !== i}
            aria-roledescription="slide"
            aria-label={`Banner ${s.id} of ${SLOTS.length}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              n === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {s.image ? (
              <BannerLink href={s.link} className="relative block h-full w-full">
                <Image
                  src={s.image}
                  alt={s.note}
                  fill
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  priority={n === 0}
                  className="object-cover"
                />
              </BannerLink>
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--color-mist-2),_var(--color-mist)_65%)] px-14 text-center sm:gap-4 sm:px-16 lg:px-20">
                <div className="hatch absolute inset-0 opacity-70" aria-hidden="true" />
                <span className="relative flex size-14 items-center justify-center rounded-2xl border border-dashed border-line-2 bg-paper/80 backdrop-blur-sm sm:size-16 lg:size-20">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-6 text-line-2 sm:size-7 lg:size-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="m3 17 5-4 4 3 3-2 6 5" />
                  </svg>
                </span>
                <p className="relative font-mono text-[10.5px] tracking-[0.16em] uppercase text-slate-soft sm:text-[11.5px]">
                  Banner slot {s.id} · {s.note}
                </p>
                <p className="relative max-w-[18rem] text-[12.5px] leading-relaxed text-slate-soft/80 sm:max-w-sm sm:text-[13.5px] lg:max-w-md">
                  Artwork to be supplied here — sized to fit phone, tablet and
                  desktop automatically.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Previous banner"
        className="absolute left-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-3 backdrop-blur transition-colors hover:text-ink sm:left-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next banner"
        className="absolute right-2.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-3 backdrop-blur transition-colors hover:text-ink sm:right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:bottom-4">
        {SLOTS.map((s, n) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Go to banner ${s.id}`}
            aria-current={n === i}
            className={`h-1.5 rounded-full transition-all ${
              n === i ? "w-7 bg-ink" : "w-1.5 bg-line-2 hover:bg-slate-soft"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** Wraps a slide in a Link only when the admin has actually set one. */
function BannerLink({
  href,
  className,
  children,
}: {
  href?: string | null;
  className: string;
  children: React.ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
