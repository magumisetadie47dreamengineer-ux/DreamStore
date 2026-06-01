"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import {
  getOrderTotal,
  getShippingCost,
} from "@/lib/shipping";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [hydrated, isAuthenticated, router]);

  const handleStripeCheckout = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to start checkout");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!hydrated || !isAuthenticated) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingCost(subtotal);
  const total = getOrderTotal(subtotal);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-2 text-base-content/60 text-sm">
        Ordering as{" "}
        <span className="font-medium text-base-content">{user.email}</span>
      </p>

      {items.length === 0 ? (
        <div className="mt-10 alert bg-base-200 border border-base-content/10 rounded-sm">
          <span>Your cart is empty.</span>
          <Link href="/products" className="btn btn-sm btn-primary rounded-sm">
            Go shopping
          </Link>
        </div>
      ) : (
        <div className="card bg-base-200 border border-base-content/10 mt-8 rounded-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Order summary</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex justify-between text-sm gap-4"
                >
                  <span className="text-base-content/80">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-mono shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="divider my-1" />
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
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total</span>
              <span className="text-primary font-mono">
                {formatPrice(total)}
              </span>
            </div>

            {error && (
              <div className="alert alert-error text-sm mt-4 rounded-sm">
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs text-base-content/40 mt-3">
              Secure payment powered by Stripe. You will be redirected to
              complete your purchase.
            </p>

            <button
              type="button"
              onClick={handleStripeCheckout}
              disabled={loading}
              className="btn btn-primary btn-block mt-4 rounded-sm font-semibold"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Pay with Stripe"
              )}
            </button>

            <Link href="/cart" className="btn btn-ghost btn-sm btn-block mt-1">
              ← Back to cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
