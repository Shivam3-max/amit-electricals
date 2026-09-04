import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Amit Electricals counter — phone, WhatsApp, address and hours.",
};

const CHANNELS = [
  {
    t: "Call the counter",
    d: "Mon–Sat, 9:30am – 7:30pm",
    href: "tel:+919915033360",
    label: "+91 99150 33360",
    icon: "M4 5c0 8.3 6.7 15 15 15v-3.2l-4-1.6-2 2a13 13 0 0 1-6.2-6.2l2-2L7.2 5H4Z",
  },
  {
    t: "WhatsApp",
    d: "Send a list, a spec, or a photo of the site",
    href: "https://wa.me/919915033360",
    label: "+91 99150 33360",
    icon: "M4 20l1.4-4.2A8 8 0 1 1 9 19.5L4 20Z",
  },
  {
    t: "Email",
    d: "For proformas and invoicing",
    href: "mailto:orders@amitelectricals.in",
    label: "orders@amitelectricals.in",
    icon: "M4 6h16v12H4Zm0 0 8 7 8-7",
  },
];

export default function ContactPage() {
  return (
    <div className="shell py-8 lg:py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <header className="max-w-2xl">
        <p className="eyebrow">Talk to a person</p>
        <h1 className="mt-2 text-[28px] lg:text-[36px]">Contact the counter</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">
          For anything the site can&apos;t answer — a spec you need matched, a delivery you need
          split, or a rate contract you want set up — call, WhatsApp, or leave a message and we will
          get back to you the same working day.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {CHANNELS.map((c) => (
              <a key={c.t} href={c.href} className="group card p-4 transition-shadow hover:shadow-lift">
                <span className="flex size-9 items-center justify-center rounded-lg bg-ink text-volt transition-colors group-hover:bg-copper group-hover:text-white">
                  <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d={c.icon} />
                  </svg>
                </span>
                <p className="mt-3 text-[13.5px] font-semibold">{c.t}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-soft">{c.d}</p>
                <p className="mt-2 text-[12.5px] font-semibold text-copper">{c.label}</p>
              </a>
            ))}
          </div>

          <div className="card mt-5 p-5">
            <p className="eyebrow">Address</p>
            <address className="mt-2 text-[14px] leading-relaxed not-italic text-ink-2">
              Amit Electricals
              <br />
              Shop No 136, Sector 15
              <br />
              Panchkula, Haryana 134113
            </address>
            <p className="mt-4 eyebrow">Counter hours</p>
            <dl className="mt-2 space-y-1 text-[13.5px] text-ink-2">
              <div className="flex justify-between border-b border-line py-1.5">
                <dt>Monday – Saturday</dt>
                <dd>9:30am – 7:30pm</dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt>Sunday</dt>
                <dd className="text-slate-soft">Closed</dd>
              </div>
            </dl>
          </div>
        </div>

        <ContactForm
          topic="general"
          messageLabel="What do you need?"
          messagePlaceholder="Product, quantity, site — as much as you have"
          submitLabel="Send message"
        />
      </div>
    </div>
  );
}
