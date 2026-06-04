"use client";

import Link from "next/link";
import ProductImage from "@/components/store/ProductImage";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import {
  FREE_SHIPPING_MIN,
  getOrderTotal,
  getShippingCost,
} from "@/lib/shipping";
import CartIcon from "@/components/store/icons/CartIcon";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const showToast = useUiStore((s) => s.showToast);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CartIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearCart();
              showToast("Cart cleared");
            }}
            className="btn btn-ghost btn-sm text-base-content/50"
          >
            Clear cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <CartIcon className="size-16 mx-auto text-base-content/15" />
          <p className="mt-4 text-base-content/50">Your cart is empty.</p>
          <Link href="/products" className="btn btn-primary mt-6 rounded-sm">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-sm border border-base-content/10 bg-base-200 p-4"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="product-photo relative h-28 w-28 shrink-0 overflow-hidden rounded-sm bg-base-300"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary font-mono text-sm mt-1">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="join">
                      <button
                        type="button"
                        onClick={() =>
                          handleQty(item.productId, item.quantity - 1)
                        }
                        className="btn btn-sm join-item rounded-sm"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="btn btn-sm join-item btn-disabled font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQty(item.productId, item.quantity + 1)
                        }
                        className="btn btn-sm join-item rounded-sm"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-mono font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="btn btn-ghost btn-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-base-200 border border-base-content/10 h-fit rounded-sm">
            <div className="card-body">
              <h2 className="card-title font-mono text-xs uppercase tracking-widest">
                Order summary
              </h2>

              {amountToFree > 0 && (
                <div className="rounded-sm bg-base-300 px-3 py-2 text-xs text-base-content/60">
                  Spend {formatPrice(amountToFree)} more for{" "}
                  <span className="text-primary font-medium">free shipping</span>
                </div>
              )}

              <div className="space-y-2 text-sm mt-2">
                <div className="flex justify-between">
                  <span className="text-base-content/60">
                    Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)
                  </span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Shipping</span>
                  <span className="font-mono">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="divider my-1" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary font-mono">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-base-content/40 mt-1">
                Free shipping on orders over {formatPrice(FREE_SHIPPING_MIN)}.
                Tax calculated at Stripe checkout.
              </p>

              <Link
                href="/checkout"
                className="btn btn-primary btn-block rounded-sm mt-4 font-semibold"
              >
                Proceed to checkout
              </Link>
              <Link
                href="/products"
                className="btn btn-ghost btn-block btn-sm mt-1"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
