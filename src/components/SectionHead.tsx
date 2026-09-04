import Link from "next/link";

export default function SectionHead({
  eyebrow,
  title,
  copy,
  href,
  hrefLabel = "View all",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`mb-8 flex flex-col gap-3 sm:flex-row sm:items-end ${
        align === "center" ? "sm:flex-col sm:items-center sm:text-center" : ""
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-[21px] sm:text-[26px] lg:text-[32px]">{title}</h2>
        {copy && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3 sm:mt-2.5 sm:text-[14.5px]">{copy}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={`shrink-0 text-[13.5px] font-semibold text-copper hover:underline ${
            align === "center" ? "" : "sm:ml-auto sm:pb-1"
          }`}
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
