"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing payment session.");
      return;
    }

    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          clearCart();
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("orders-refresh", String(Date.now()));
          }
          setStatus("success");
          setMessage(data.message || "Order placed successfully");
          setTimeout(() => router.push("/account"), 2500);
        } else {
          setStatus("error");
          setMessage(data.message || "Could not confirm order");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong confirming your order.");
      });
  }, [sessionId, clearCart, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {status === "loading" && (
        <>
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="mt-4 text-base-content/70">Confirming your payment…</p>
        </>
      )}
      {status === "success" && (
        <div className="alert alert-success flex-col gap-2">
          <span className="font-bold text-lg">Payment successful!</span>
          <p>{message}</p>
          <p className="text-sm">Redirecting to your account…</p>
        </div>
      )}
      {status === "error" && (
        <div className="alert alert-error flex-col gap-2">
          <span className="font-bold">Something went wrong</span>
          <p>{message}</p>
          <Link href="/account" className="btn btn-sm btn-primary mt-2">
            Go to account
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
