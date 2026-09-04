import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Amit Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const [enquiries, messages] = await Promise.all([
    db.enquiry.count({ where: { status: "NEW" } }),
    db.message.count({ where: { status: "NEW" } }),
  ]);

  return <AdminShell counts={{ enquiries, messages }}>{children}</AdminShell>;
}
