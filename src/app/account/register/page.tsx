import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create a trade account",
  description: "Register once and every future enquiry auto-fills your firm's details.",
};

export default function RegisterPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ href: "/account/login", label: "Account" }, { label: "Register" }]} />
      <div className="mx-auto max-w-lg">
        <header className="mb-7 text-center">
          <p className="eyebrow">Trade account</p>
          <h1 className="mt-2 text-[26px] lg:text-[32px]">Register once, quote instantly</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-3">
            Save your firm's details here and every enquiry after this one auto-fills — no retyping
            your company, GSTIN or phone number every time you order.
          </p>
        </header>
        <RegisterForm />
      </div>
    </div>
  );
}
