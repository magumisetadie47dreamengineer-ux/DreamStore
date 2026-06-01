import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  return (
    <article className="card card-glow bg-base-200 rounded-sm overflow-hidden flex flex-col">
      <Link
        href={`/products/${product._id}`}
        className="group block"
      >
        <figure className="product-photo relative aspect-[4/3] bg-base-300 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.featured && (
            <span className="badge badge-primary rounded-sm absolute left-2 top-2 font-mono text-[10px] uppercase">
              Featured
            </span>
          )}
          {product.stock < 1 && (
            <span className="badge badge-neutral rounded-sm absolute right-2 top-2 font-mono text-[10px] uppercase">
              Sold out
            </span>
          )}
        </figure>
        <div className="card-body p-4 pb-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary">
            {product.category}
          </p>
          <h3 className="card-title text-base font-semibold text-base-content">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-base-content/50">
            {product.description}
          </p>
          <p className="text-lg font-bold text-primary mt-2 font-mono">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4 mt-auto">
        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
