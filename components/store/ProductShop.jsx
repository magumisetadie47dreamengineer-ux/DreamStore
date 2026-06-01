"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export default function ProductShop({ products, categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const inStockOnly = searchParams.get("inStock") === "1";

  const filtered = useMemo(() => {
    let list = [...products];

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [products, q, category, sort, inStockOnly]);

  const setParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-base-content/50 font-mono">
          {filtered.length} of {products.length} products
          {q ? ` · “${searchParams.get("q")}”` : ""}
        </p>

        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm rounded-sm bg-base-200"
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value })}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label className="label cursor-pointer gap-2 border border-base-content/10 rounded-sm px-3 bg-base-200">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary rounded-sm"
              checked={inStockOnly}
              onChange={(e) =>
                setParams({ inStock: e.target.checked ? "1" : "" })
              }
            />
            <span className="label-text text-xs">In stock only</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          className={`badge badge-sm rounded-sm font-mono uppercase cursor-pointer ${
            !category ? "badge-primary" : "badge-outline"
          }`}
          onClick={() => setParams({ category: "" })}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`badge badge-sm rounded-sm font-mono uppercase cursor-pointer ${
              category === cat ? "badge-primary" : "badge-outline"
            }`}
            onClick={() => setParams({ category: cat })}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-base-content/50">No products match your filters.</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-4"
            onClick={() => router.replace(pathname)}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
