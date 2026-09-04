import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BasketProvider } from "@/components/BasketProvider";
import { DealerProvider } from "@/components/DealerProvider";
import CompareTray from "@/components/CompareTray";
import { departments, stats } from "@/lib/catalog";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://amitelectricals.example"),
  title: {
    default: "Amit Electricals — Bulk electrical ordering for the trade",
    template: "%s · Amit Electricals",
  },
  description:
    `Authorised distributor for Surya, Polycab, Halonix and Indo. Browse ${stats.products}+ ` +
    "products, build a bulk enquiry across brands and get a quote back from one counter.",
  applicationName: "Amit Electricals",
  keywords: [
    "electrical distributor",
    "bulk electrical order",
    "Polycab distributor",
    "Surya lighting dealer",
    "Halonix distributor",
    "Indo appliances dealer",
    "wires and cables wholesale",
  ],
  openGraph: {
    title: "Amit Electricals — Bulk electrical ordering for the trade",
    description:
      "One counter for Surya, Polycab, Halonix and Indo. Order pad, bulk upload and cross-brand comparison.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1622",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <DealerProvider>
          <BasketProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
            >
              Skip to content
            </a>
            <Header departments={departments} />
            <main id="main">{children}</main>
            <Footer departments={departments} />
            <CompareTray />
          </BasketProvider>
        </DealerProvider>
      </body>
    </html>
  );
}
