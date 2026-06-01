"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import {
  FREE_SHIPPING_MIN,
  getOrderTotal,
  getShippingCost,
} from "@/lib/shipping";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import CartIcon from "./icons/CartIcon";

export default function CartDrawer() {
  const open = useUiStore((s) => s.cartDrawerOpen);
  const closeCartDrawer = useUiStore((s) => s.closeCartDrawer);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const showToast = useUiStore((s) => s.showToast);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeCartDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeCartDrawer]);

  if (!hydrated) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingCost(subtotal);
  const total = getOrderTotal(subtotal);
  const amountToFree = FREE_SHIPPING_MIN - subtotal;

  const handleQty = (productId, qty) => {
    const result = updateQuantity(productId, qty);
    if (result?.ok === false) showToast(result.message);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCartDrawer}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-base-content/10 bg-base-100 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-base-content/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <CartIcon className="size-5 text-primary" />
            <h2 className="font-bold tracking-tight">Your cart</h2>
            {items.length > 0 && (
              <span className="badge badge-outline badge-sm font-mono">
                {items.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <CartIcon className="size-14 text-base-content/20" />
            <p className="text-base-content/50">Your cart is empty</p>
            <Link
              href="/products"
              onClick={closeCartDrawer}
              className="btn btn-primary btn-sm rounded-sm"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-sm border border-base-content/10 bg-base-200 p-3"
                >
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={closeCartDrawer}
                    className="product-photo relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-base-300"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      onClick={closeCartDrawer}
                      className="font-medium text-sm line-clamp-2 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary font-mono text-sm mt-0.5">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="join join-horizontal">
                        <button
                          type="button"
                          className="btn btn-xs join-item rounded-sm"
                          onClick={() =>
                            handleQty(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="btn btn-xs join-item btn-disabled font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-xs join-item rounded-sm"
                          onClick={() =>
                            handleQty(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-base-content/40 hover:text-base-content"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-base-content/10 p-5 space-y-3 bg-base-200">
              {amountToFree > 0 && subtotal > 0 && (
                <p className="text-xs text-base-content/50 font-mono">
                  Add {formatPrice(amountToFree)} more for free shipping
                </p>
              )}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Shipping</span>
                  <span className="font-mono">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Total</span>
                  <span className="font-mono text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                className="btn btn-outline btn-block btn-sm rounded-sm border-base-content/20"
              >
                View full cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="btn btn-primary btn-block rounded-sm font-semibold"
              >
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
