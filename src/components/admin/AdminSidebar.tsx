"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z" }],
  },
  {
    group: "Orders",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "M4 5h2l2.6 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 9H7", badgeKey: "enquiries" },
      { href: "/admin/dealers", label: "Dealers", icon: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11 9v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { href: "/admin/messages", label: "Messages", icon: "M4 6h16v12H4Zm0 0 8 7 8-7", badgeKey: "messages" },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { href: "/admin/catalog", label: "Products", icon: "M20 7 12 3 4 7l8 4 8-4Zm0 0v10l-8 4m0-10v10M4 7v10l8 4" },
      { href: "/admin/content", label: "Homepage content", icon: "M4 5h16M4 5v14h16V5M8 9h8M8 13h5" },
    ],
  },
];

export default function AdminSidebar({
  counts,
}: {
  counts: { enquiries: number; messages: number };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-white/10 bg-ink text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
          <svg viewBox="0 0 24 24" className="size-4 text-volt" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
          </svg>
        </span>
        <span className="font-display text-[14px] font-bold tracking-[-0.01em]">Amit Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="mb-1.5 px-2 font-mono text-[10px] tracking-[0.12em] uppercase text-white/35">
              {g.group}
            </p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.href);
                const badge = "badgeKey" in item ? counts[item.badgeKey as keyof typeof counts] : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                      active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d={item.icon} />
                    </svg>
                    <span className="flex-1 truncate">{item.label}</span>
                    {!!badge && (
                      <span className="rounded-full bg-volt px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-white/50 hover:bg-white/5 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 19l-7-7 7-7M3 12h18" />
          </svg>
          View storefront
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-white/50 hover:bg-white/5 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
