import { Suspense } from "react";
import ProductShop from "@/components/store/ProductShop";
import SearchBar from "@/components/store/SearchBar";
import { brand } from "@/lib/brand";
import { getProductsServer } from "@/lib/products/getProductsServer";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProductsServer();
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="rounded-sm border border-base-content/10 bg-base-200 p-8 mb-10 tech-grid-bg">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
          {brand.dreamChaser} · Shop
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">
          Tech & gadgets
        </h1>
        <p className="mt-2 text-sm italic text-base-content/60">
          &ldquo;{brand.mantra}&rdquo;
        </p>
        <div className="mt-6 sm:hidden">
          <Suspense fallback={null}>
            <SearchBar className="w-full" />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <p className="text-center text-base-content/50 font-mono text-sm py-12">
            Loading products…
          </p>
        }
      >
        <ProductShop products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
