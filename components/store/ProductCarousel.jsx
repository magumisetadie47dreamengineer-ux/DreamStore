"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import CartIcon from "./icons/CartIcon";

export default function ProductCarousel({ products }) {
  const [active, setActive] = useState(0);
  const count = products.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count]);

  if (!count) {
    return (
      <p className="text-center text-base-content/50 font-mono text-sm">
        No featured products yet.
      </p>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-sm bg-base-200 overflow-hidden border border-base-content/10">
        <div className="grid w-full gap-0 md:grid-cols-2 md:items-stretch">
          <div className="product-photo relative aspect-[4/3] md:aspect-auto md:min-h-[360px] bg-base-300">
            {products.map((p, i) => (
              <div
                key={p._id}
                className="carousel-fade-layer absolute inset-0"
                style={{
                  opacity: i === active ? 1 : 0,
                  zIndex: i === active ? 10 : 0,
                }}
                aria-hidden={i !== active}
              >
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div className="relative min-h-[280px] md:min-h-[360px] border-t md:border-t-0 md:border-l border-base-content/10">
            {products.map((p, i) => (
              <div
                key={`info-${p._id}`}
                className="carousel-fade-layer absolute inset-0 flex flex-col justify-center gap-3 p-6"
                style={{
                  opacity: i === active ? 1 : 0,
                  zIndex: i === active ? 10 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                }}
                aria-hidden={i !== active}
              >
                <span className="badge badge-outline border-primary/40 text-primary rounded-sm font-mono text-[10px] uppercase">
                  {p.category}
                </span>
                <h3 className="text-2xl font-bold tracking-tight">{p.name}</h3>
                <p className="line-clamp-3 text-base-content/55 text-sm">
                  {p.description}
                </p>
                <p className="text-2xl font-bold text-primary font-mono">
                  {formatPrice(p.price)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Link
                    href={`/products/${p._id}`}
                    className="btn btn-primary btn-sm rounded-sm"
                  >
                    View product
                  </Link>
                  <Link
                    href="/cart"
                    className="btn btn-outline btn-sm rounded-sm border-base-content/20 gap-1"
                  >
                    <CartIcon className="size-4" />
                    Cart
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 mt-4" aria-hidden>
          {products.map((p, i) => (
            <span
              key={p._id}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === active ? "w-8 bg-primary" : "w-1 bg-base-content/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
