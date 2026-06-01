"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import CartIcon from "./icons/CartIcon";

export default function AddToCartButton({
  product,
  compact = false,
  showQuantity = false,
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const showToast = useUiStore((s) => s.showToast);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = product.stock > 0;
  const maxQty = product.stock;

  const handleAdd = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const result = addItem(product, showQuantity ? quantity : 1);
    if (!result.ok) {
      showToast(result.message);
      return;
    }

    setAdded(true);
    showToast(`${product.name} added to cart`);
    openCartDrawer();
    setTimeout(() => setAdded(false), 2000);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="btn btn-primary btn-sm w-full rounded-sm gap-1 font-semibold"
        aria-label={inStock ? `Add ${product.name} to cart` : "Out of stock"}
      >
        <CartIcon className="size-4" />
        {inStock ? (added ? "Added" : "Add") : "Sold out"}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {showQuantity && inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-base-content/60 font-mono uppercase text-[10px] tracking-wider">
            Quantity
          </span>
          <div className="join">
            <button
              type="button"
              className="btn btn-sm join-item rounded-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="btn btn-sm join-item btn-disabled font-mono min-w-[2.5rem]">
              {quantity}
            </span>
            <button
              type="button"
              className="btn btn-sm join-item rounded-sm"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
            >
              +
            </button>
          </div>
          <span className="text-xs text-base-content/40">
            {maxQty} available
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="btn btn-primary w-full rounded-sm font-semibold tracking-wide gap-2 disabled:opacity-50"
      >
        <CartIcon className="size-5" />
        {!inStock
          ? "Out of stock"
          : added
            ? "Added to cart ✓"
            : "Add to cart"}
      </button>
    </div>
  );
}
