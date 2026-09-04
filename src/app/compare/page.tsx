import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare products",
  description: "Compare up to four products across Surya, Polycab, Halonix and Indo, spec by spec.",
};

export default function ComparePage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Compare" }]} />
      <header className="max-w-2xl">
        <p className="eyebrow">Cross-brand comparison</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">Compare products</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Add up to four products to the compare tray from anywhere in the catalogue — the icon sits
          on every product card and product page.
        </p>
      </header>
      <div className="mt-8">
        <CompareClient />
      </div>
    </div>
  );
}
