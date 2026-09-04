import type { Metadata } from "next";
import EnquiryClient from "@/components/EnquiryClient";

export const metadata: Metadata = {
  title: "My enquiry list",
  description: "Review your list and send it to the counter for a proforma quote.",
};

export default function EnquiryPage() {
  return <EnquiryClient />;
}
