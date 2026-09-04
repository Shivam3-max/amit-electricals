import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: __dirname },
  // Brand asset hosts, ready for when the real product photography is ingested.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.polycab.com" },
      { protocol: "https", hostname: "crm.surya.co.in" },
      { protocol: "https", hostname: "www.halonix.co.in" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default config;
