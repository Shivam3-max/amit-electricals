const ICONS: Record<string, React.ReactNode> = {
  "wires-cables": (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19.5 8.5c2-1.4 3.4 1 2 2.4" />
    </>
  ),
  lighting: (
    <>
      <path d="M12 3a5.5 5.5 0 0 0-3.2 10v2.5h6.4V13A5.5 5.5 0 0 0 12 3Z" />
      <path d="M9.6 18.5h4.8M10.4 21h3.2" />
    </>
  ),
  fans: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c-2.4-1.8-5.2-.4-4.6 1.9M14 12c1.8 2.4.4 5.2-1.9 4.6M10 12c-1.8-2.4-.4-5.2 1.9-4.6M14 12c2.4-1.8 5.2-.4 4.6 1.9" />
    </>
  ),
  switches: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <rect x="8.5" y="6" width="7" height="4.5" rx="1" />
      <circle cx="10" cy="16" r="1.4" />
      <circle cx="14" cy="16" r="1.4" />
    </>
  ),
  switchgear: (
    <>
      <rect x="8" y="3" width="8" height="18" rx="1.5" />
      <rect x="10" y="6" width="4" height="5" rx="0.8" />
      <path d="M9.5 14h5M9.5 17h5" />
    </>
  ),
  appliances: (
    <>
      <rect x="6" y="3" width="12" height="16" rx="5" />
      <path d="M9 7h6" />
      <circle cx="12" cy="13" r="2" />
      <path d="M9 21v-2M15 21v-2" />
    </>
  ),
  solar: (
    <>
      <path d="M4 15l3-10h10l3 10Z" />
      <path d="M5.4 10h13.2M12 5v10" />
      <path d="M12 15v5M9 21h6" />
    </>
  ),
};

export default function DeptIcon({ slug, className = "size-6" }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[slug] ?? <rect x="4" y="4" width="16" height="16" rx="3" />}
    </svg>
  );
}
