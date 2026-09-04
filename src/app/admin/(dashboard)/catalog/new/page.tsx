import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="p-5 lg:p-8">
      <Link href="/admin/catalog" className="text-[12.5px] font-semibold text-copper hover:underline">
        ← All products
      </Link>
      <h1 className="mt-3 text-[24px] lg:text-[28px]">Add a product</h1>
      <p className="mt-1.5 max-w-xl text-[13px] text-ink-3">
        For Rexsun's own range, or anything else that isn't in the scraped brand feeds.
      </p>

      <div className="mt-6">
        <ProductForm
          isNew
          initial={{
            code: "",
            name: "",
            brand: "Rexsun",
            dept: "lighting",
            category: "",
            description: "",
            stock: "in-stock",
            specs: {},
            images: [],
            hasOverride: false,
          }}
        />
      </div>
    </div>
  );
}
