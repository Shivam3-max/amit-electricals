import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import BulkUploadClient from "@/components/BulkUploadClient";

export const metadata: Metadata = {
  title: "Bulk upload",
  description: "Upload a CSV schedule of quantities and we will match every line to the catalogue.",
};

export default function BulkUploadPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Bulk upload" }]} />
      <header className="max-w-2xl">
        <p className="eyebrow">For a full schedule of quantities</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">Upload your list</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          Built for a bill of quantities or a long site schedule — upload a CSV and we match every
          row to the catalogue, flag anything unclear, and let you add the confirmed lines to your
          enquiry list in one go.
        </p>
      </header>
      <div className="mt-8">
        <BulkUploadClient />
      </div>
    </div>
  );
}
