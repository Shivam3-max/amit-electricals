/** Wordmark: a socket-plate mark paired with the trade name. */
export default function Logo({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
        fill="none"
        strokeLinecap="round"
      >
        <rect
          x="1.25"
          y="1.25"
          width="37.5"
          height="37.5"
          rx="10"
          fill={onDark ? "#ffffff" : "#0b1622"}
        />
        <path
          d="M20 8.5 12 22h6.4l-1.9 9.5L28 17.4h-6.6z"
          fill={onDark ? "#0b1622" : "#f2c230"}
        />
        <circle cx="12.4" cy="30.4" r="1.7" fill={onDark ? "#b26a38" : "#b26a38"} />
        <circle cx="28.6" cy="9.6" r="1.7" fill="#b26a38" />
      </svg>

      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-[17px] font-extrabold tracking-[-0.02em] ${
              onDark ? "text-paper" : "text-ink"
            }`}
          >
            Amit Electricals
          </span>
          <span
            className={`mt-[3px] font-mono text-[9.5px] font-medium tracking-[0.16em] uppercase ${
              onDark ? "text-white/55" : "text-slate-soft"
            }`}
          >
            Authorised distributor
          </span>
        </span>
      )}
    </span>
  );
}
