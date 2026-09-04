import Link from "next/link";
import { notFound } from "next/navigation";
import { getByCode } from "@/lib/catalog";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = getByCode(code);
  if (!product) notFound();

  const override = await db.productOverride.findUnique({ where: { code: product.code } });

  return (
    <div className="p-5 lg:p-8">
      <Link href="/admin/catalog" className="text-[12.5px] font-semibold text-copper hover:underline">
        ← All products
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <h1 className="text-[24px] lg:text-[28px]">{product.name}</h1>
        <span className="code-chip">{product.code}</span>
      </div>
      <p className="mt-1 text-[13px] text-ink-3">
        <Link href={`/product/${product.slug}`} target="_blank" className="text-copper hover:underline">
          View on the storefront ↗
        </Link>
      </p>

      <div className="mt-6">
        <ProductForm
          isNew={false}
          initial={{
            code: product.code,
            name: product.name,
            brand: product.brand,
            dept: product.dept,
            category: product.category,
            description: product.description,
            stock: product.stock,
            specs: product.specs,
            images: product.localImages,
            hasOverride: !!override,
          }}
        />
      </div>
    </div>
  );
}
