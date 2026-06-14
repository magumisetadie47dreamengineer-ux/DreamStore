"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { getOrderTotal, getShippingCost } from "@/lib/shipping";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const PESEPAY_REFERENCE_KEY = "pesepay-reference";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const [hydrated, setHydrated] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [hydrated, isAuthenticated, router]);

  const startCheckout = async (method) => {
    setError("");
    setLoadingMethod(method);

    const endpoint =
      method === "pesepay" ? "/api/checkout/pesepay" : "/api/checkout";

    try {
      const res = await fetch(endpoint, {
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
        if (method === "pesepay") {
          if (data.referenceNumber) {
            sessionStorage.setItem(PESEPAY_REFERENCE_KEY, data.referenceNumber);
          }
          if (data.checkoutToken) {
            sessionStorage.setItem("pesepay-token", data.checkoutToken);
          }
        }
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to start checkout");
        setLoadingMethod(null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoadingMethod(null);
    }
  };

  if (!hydrated || !isAuthenticated) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingCost(subtotal);
  const total = getOrderTotal(subtotal);
  const loading = loadingMethod !== null;

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
              Choose a payment method below. You will be redirected to complete
              your purchase securely.
            </p>

            <button
              type="button"
              onClick={() => startCheckout("pesepay")}
              disabled={loading}
              className="btn btn-primary btn-block mt-4 rounded-sm font-semibold"
            >
              {loadingMethod === "pesepay" ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Pay with Pesepay"
              )}
            </button>

            <button
              type="button"
              onClick={() => startCheckout("stripe")}
              disabled={loading}
              className="btn btn-outline btn-block mt-2 rounded-sm font-semibold"
            >
              {loadingMethod === "stripe" ? (
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
