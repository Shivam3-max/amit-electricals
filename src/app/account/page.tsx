import type { Metadata } from "next";
import AccountClient from "@/components/AccountClient";

export const metadata: Metadata = {
  title: "My account",
  description: "Your saved details and past enquiries.",
};

export default function AccountPage() {
  return <AccountClient />;
}
