import Link from "next/link";
import AddToCartButton from "@/components/store/AddToCartButton";
import ProductImage from "@/components/store/ProductImage";
import { brand } from "@/lib/brand";
import { formatPrice } from "@/lib/formatPrice";
import { getProductByIdServer } from "@/lib/products/getProductsServer";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductByIdServer(id);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block text-primary">
          ← Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/products"
        className="text-sm font-mono text-primary hover:text-accent"
      >
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="product-photo relative aspect-square overflow-hidden rounded-sm border border-base-content/10 bg-base-300">
          <ProductImage
            src={product.image}
            alt={product.name}
            fill
            className="transition-transform duration-500"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-primary font-mono">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 text-base-content/60 leading-relaxed">
            {product.description}
          </p>
          <p className="mt-4 text-sm text-base-content/40 font-mono">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </p>
          <p className="mt-6 text-sm italic text-primary/80">
            &ldquo;{brand.mantra}&rdquo;
          </p>
          <div className="mt-8 max-w-sm">
            <AddToCartButton product={product} showQuantity />
          </div>
        </div>
      </div>
    </div>
  );
}
