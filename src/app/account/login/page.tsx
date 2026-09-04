import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your trade account to reorder faster.",
};

export default function LoginPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Sign in" }]} />
      <div className="mx-auto max-w-lg">
        <header className="mb-7 text-center">
          <p className="eyebrow">Trade account</p>
          <h1 className="mt-2 text-[26px] lg:text-[32px]">Welcome back</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-3">
            Sign in to skip retyping your details and see your past enquiries.
          </p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
