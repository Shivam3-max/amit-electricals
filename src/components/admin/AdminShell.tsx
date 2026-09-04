"use client";

import { useState, type ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  counts,
  children,
}: {
  counts: { enquiries: number; messages: number };
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="flex min-h-screen bg-mist">
      <div className="hidden lg:block">
        <AdminSidebar counts={counts} />
      </div>

      {drawer && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawer(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0">
            <AdminSidebar counts={counts} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="btn btn-ghost size-9 rounded-lg p-0"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="font-display text-[14px] font-bold">Amit Admin</span>
        </div>
        {children}
      </div>
    </div>
  );
}
