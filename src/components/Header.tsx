"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import SearchBox from "./SearchBox";
import { useBasket } from "./BasketProvider";
import { useDealer } from "./DealerProvider";
import type { Department } from "@/lib/types";

const UTILITY = [
  { href: "/corporate-gifting", label: "Corporate & gifting" },
  { href: "/become-a-dealer", label: "Become a dealer" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const TOOLS = [
  { href: "/order-pad", label: "Order pad", hint: "Type or paste codes" },
  { href: "/bulk-upload", label: "Bulk upload", hint: "CSV or Excel list" },
  { href: "/compare", label: "Compare", hint: "Across brands" },
];

export default function Header({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { count, ready } = useBasket();
  const { dealer, ready: dealerReady } = useDealer();

  useEffect(() => {
    setDrawer(false);
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const hoverOpen = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(slug);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const active = departments.find((d) => d.slug === open);

  return (
    <header className="sticky top-0 z-50 bg-paper">
      {/* Utility strip */}
      <div className="hidden bg-ink text-white/70 lg:block">
        <div className="shell flex h-9 items-center justify-between text-[12.5px]">
          <p className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-volt" />
            Authorised distributor · Surya · Polycab · Halonix · Indo
          </p>
          <nav className="flex items-center gap-5">
            {UTILITY.map((u) => (
              <Link key={u.href} href={u.href} className="transition-colors hover:text-white">
                {u.label}
              </Link>
            ))}
            <Link
              href={dealerReady && dealer ? "/account" : "/account/login"}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" />
              </svg>
              {dealerReady && dealer ? dealer.company : "Sign in"}
            </Link>
            <a href="tel:+919915033360" className="font-medium text-white">
              +91 99150 33360
            </a>
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`border-b border-line bg-paper transition-shadow ${
          stuck ? "shadow-[0_1px_0_0_var(--color-line),0_10px_24px_-20px_rgba(11,22,34,0.4)]" : ""
        }`}
      >
        <div className="shell flex h-[68px] items-center gap-4">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="btn btn-ghost -ml-2 size-10 rounded-lg p-0 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" aria-label="Amit Electricals home" className="shrink-0">
            <Logo />
          </Link>

          <div className="ml-auto hidden max-w-xl flex-1 lg:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href="/order-pad" className="btn btn-sm btn-line hidden sm:inline-flex">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
              </svg>
              Order pad
            </Link>
            <Link
              href={dealerReady && dealer ? "/account" : "/account/login"}
              aria-label={dealerReady && dealer ? `Account · ${dealer.company}` : "Sign in or register"}
              className="btn btn-sm btn-line px-2.5 sm:px-3.5"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M4.5 20c1.4-4.2 4.3-6.3 7.5-6.3s6.1 2.1 7.5 6.3" />
              </svg>
              <span className="hidden sm:inline">
                {dealerReady && dealer ? dealer.company : "Sign in"}
              </span>
            </Link>
            <Link href="/enquiry" className="btn btn-sm btn-ink relative">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 5h2l2.6 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 9H7" />
                <circle cx="10" cy="20" r="1.2" />
                <circle cx="18" cy="20" r="1.2" />
              </svg>
              <span className="hidden sm:inline">Enquiry list</span>
              <span
                className={`ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] leading-4 transition-colors ${
                  ready && count ? "bg-volt text-ink" : "bg-white/15 text-white/70"
                }`}
              >
                {ready ? count : 0}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="shell pb-3 lg:hidden">
          <SearchBox />
        </div>
      </div>

      {/* Department nav + mega menu */}
      <div
        ref={navRef}
        className="relative hidden border-b border-line bg-paper lg:block"
        onMouseLeave={hoverClose}
      >
        <div className="shell flex h-12 items-center gap-1">
          {departments.map((d) => {
            const isOpen = open === d.slug;
            return (
              <Link
                key={d.slug}
                href={`/catalog/${d.slug}`}
                onMouseEnter={() => hoverOpen(d.slug)}
                onFocus={() => hoverOpen(d.slug)}
                aria-expanded={isOpen}
                className={`relative flex h-12 items-center px-3 text-[13.5px] font-semibold transition-colors ${
                  isOpen || pathname.startsWith(`/catalog/${d.slug}`)
                    ? "text-copper"
                    : "text-ink-2 hover:text-ink"
                }`}
              >
                {d.label}
                <span
                  className={`absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-copper transition-transform duration-200 ${
                    isOpen || pathname.startsWith(`/catalog/${d.slug}`) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}

          <span className="mx-2 h-5 w-px bg-line" />
          <Link
            href="/brands"
            className="flex h-12 items-center px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            Brands
          </Link>
          <Link
            href="/corporate-gifting"
            className="flex h-12 items-center px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            Corporate gifting
          </Link>

          <div className="ml-auto flex items-center gap-1">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-md px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase text-slate-soft transition-colors hover:bg-mist-2 hover:text-ink"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mega panel */}
        {active && (
          <div
            className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-pop"
            onMouseEnter={() => hoverOpen(active.slug)}
          >
            <div className="shell grid grid-cols-[1fr_300px] gap-10 py-7">
              <div>
                <div className="mb-4 flex items-baseline gap-3">
                  <h3 className="text-[17px]">{active.label}</h3>
                  <span className="code-chip">{active.count} products</span>
                  <Link
                    href={`/catalog/${active.slug}`}
                    className="ml-auto text-[13px] font-semibold text-copper hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-x-6 gap-y-1">
                  {active.categories.slice(0, 24).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/catalog/${active.slug}/${c.slug}`}
                      className="group flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-mist hover:text-ink"
                    >
                      <span className="truncate">{c.label}</span>
                      <span className="font-mono text-[10.5px] text-slate-soft group-hover:text-copper">
                        {c.count}
                      </span>
                    </Link>
                  ))}
                </div>
                {active.categories.length > 24 && (
                  <Link
                    href={`/catalog/${active.slug}`}
                    className="mt-3 inline-block px-2 text-[12.5px] font-semibold text-slate-soft hover:text-ink"
                  >
                    +{active.categories.length - 24} more categories
                  </Link>
                )}
              </div>

              <aside className="rounded-card border border-line bg-mist p-5">
                <p className="eyebrow">Brands in {active.label.toLowerCase()}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.brands.map((b) => (
                    <Link
                      key={b}
                      href={`/catalog/${active.slug}?brand=${encodeURIComponent(b)}`}
                      className="rounded-full border border-line-2 bg-paper px-2.5 py-1 text-[12px] font-medium transition-colors hover:border-ink-3"
                    >
                      {b}
                    </Link>
                  ))}
                </div>
                <p className="mt-5 text-[13px] leading-relaxed text-ink-3">{active.blurb}</p>
                <Link href="/order-pad" className="btn btn-sm btn-copper mt-4 w-full">
                  Bulk order this section
                </Link>
              </aside>
            </div>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/45"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo compact />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className="btn btn-ghost size-10 rounded-lg p-0"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              <div className="mb-4 grid grid-cols-2 gap-2 px-2">
                {TOOLS.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-lg border border-line bg-mist px-3 py-2.5"
                  >
                    <span className="block text-[13.5px] font-semibold">{t.label}</span>
                    <span className="block text-[11.5px] text-slate-soft">{t.hint}</span>
                  </Link>
                ))}
              </div>

              {departments.map((d) => {
                const isOpen = expanded === d.slug;
                return (
                  <div key={d.slug} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : d.slug)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-2 py-3 text-left"
                    >
                      <span className="text-[14.5px] font-semibold">{d.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-soft">{d.count}</span>
                        <svg
                          viewBox="0 0 24 24"
                          className={`size-4 text-slate-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-3">
                        <Link
                          href={`/catalog/${d.slug}`}
                          className="block px-4 py-2 text-[13px] font-semibold text-copper"
                        >
                          All {d.label.toLowerCase()} →
                        </Link>
                        {d.categories.slice(0, 14).map((c) => (
                          <Link
                            key={c.slug}
                            href={`/catalog/${d.slug}/${c.slug}`}
                            className="flex items-baseline justify-between px-4 py-2 text-[13px] text-ink-2"
                          >
                            <span className="truncate">{c.label}</span>
                            <span className="font-mono text-[10.5px] text-slate-soft">{c.count}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-5 space-y-1 px-2">
                <Link
                  href={dealerReady && dealer ? "/account" : "/account/login"}
                  className="block py-2 text-[14px] font-semibold text-copper"
                >
                  {dealerReady && dealer ? `My account · ${dealer.company}` : "Sign in / Register"}
                </Link>
                <Link href="/brands" className="block py-2 text-[14px] font-semibold">
                  Brands
                </Link>
                {UTILITY.map((u) => (
                  <Link key={u.href} href={u.href} className="block py-2 text-[14px] text-ink-2">
                    {u.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-line p-4">
              <a href="tel:+919915033360" className="btn btn-ink w-full">
                Call the counter · +91 99150 33360
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
