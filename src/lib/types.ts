export type Variant = {
  label: string;
  attrs: Record<string, string>;
  boxQty: number | null;
  mrp: number | null;
};

export type Product = {
  code: string;
  slug: string;
  name: string;
  brand: string;
  dept: string;
  category: string;
  categorySlug: string;
  series: string;
  description: string;
  specs: Record<string, string>;
  variants: Variant[];
  facets: Record<string, string>;
  /** Captured from the brand feed but never rendered — the site is enquiry-only. */
  mrp: number | null;
  stock: "in-stock" | "indent";
  images: string[];
  localImages: string[];
  source: string;
  rawPath: string[];
};

/** Slim row shipped to the browser for search, filtering and the order pad. */
export type IndexRow = {
  c: string; // code
  s: string; // slug
  n: string; // name
  b: string; // brand
  d: string; // department slug
  k: string; // category slug
  kl: string; // category label
  w: string; // wattage facet
  v: number; // variant count
  st: string; // stock
  i: string; // local image
};

export type Category = {
  slug: string;
  label: string;
  count: number;
  brands: string[];
};

export type Department = {
  slug: string;
  label: string;
  blurb: string;
  count: number;
  brands: string[];
  categories: Category[];
};

export type BrandMeta = { slug: string; label: string; note: string };

/** A registered dealer, as sent to the client (no password hash). */
export type Dealer = {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  city: string | null;
  address: string | null;
  tier: "RETAILER" | "DEALER" | "PROJECT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

/** One line in the enquiry basket. */
export type BasketLine = {
  code: string;
  slug: string;
  name: string;
  brand: string;
  variant: string | null;
  qty: number;
  uom: "pcs" | "box";
  boxQty: number | null;
  note: string;
  image: string;
};
