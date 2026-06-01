"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { dashboardPathForRole } from "@/lib/auth/redirectByRole";
import { apiFetch } from "@/lib/apiClient";
import { brand } from "@/lib/brand";
import { formatPrice } from "@/lib/formatPrice";
import { signOut } from "@/lib/auth/signOut";
import { useAuthStore } from "@/store/authStore";

export default function UserInfo() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);
  const [hydrated, setHydrated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hydrated || !hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/account");
      return;
    }
    if (user?.role === "admin") {
      router.replace("/dashboard/admin");
      return;
    }
    if (user?.role === "accounts") {
      router.replace("/dashboard/accounts");
    }
  }, [hydrated, hasHydrated, isAuthenticated, user, router]);

  const loadAccountData = useCallback(() => {
    if (!user?.id || user.role !== "buyer") return;

    Promise.all([apiFetch("/api/orders"), apiFetch("/api/invoices")])
      .then(async ([ordersRes, invoicesRes]) => {
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          if (Array.isArray(data)) setOrders(data);
        }
        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          if (Array.isArray(data)) setInvoices(data);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  useEffect(() => {
    loadAccountData();
    const onFocus = () => loadAccountData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadAccountData]);

  useEffect(() => {
    const stamp = sessionStorage.getItem("orders-refresh");
    if (!stamp) return;
    sessionStorage.removeItem("orders-refresh");
    loadAccountData();
  }, [loadAccountData]);

  if (!hydrated || !hasHydrated || !user || user.role !== "buyer") {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
        {brand.dreamChaser}
      </p>
      <h1 className="text-3xl font-bold tracking-tight">My account</h1>
      <p className="mt-1 text-base-content/50">
        {brand.name} · Buyer
      </p>

      <div className="mt-8 rounded-sm border border-base-content/10 bg-base-200 p-6">
        <div className="space-y-2 text-base-content/70">
          <p>
            Name:{" "}
            <span className="font-semibold text-base-content">{user.name}</span>
          </p>
          <p>
            Email:{" "}
            <span className="font-semibold text-base-content">{user.email}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut(router)}
          className="btn btn-error btn-sm mt-6 rounded-sm"
        >
          Log out
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <p className="text-sm text-base-content/50 mt-1">
          Issued by admin after your order is processed
        </p>
        {invoices.length === 0 ? (
          <p className="mt-4 text-base-content/50 text-sm">
            No invoices yet. They appear here once your order is processed.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {invoices.map((inv) => (
              <li
                key={inv._id}
                className="rounded-sm border border-base-content/10 bg-base-200 p-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-mono text-sm text-primary font-bold">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    {formatPrice(inv.total)}
                  </span>
                </div>
                <ul className="mt-3 text-sm text-base-content/60 space-y-1">
                  {inv.lines?.map((line, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {line.name} × {line.quantity}
                      </span>
                      <span className="font-mono">
                        {formatPrice(line.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                {inv.shipping > 0 && (
                  <p className="text-xs mt-2 text-base-content/40">
                    Shipping: {formatPrice(inv.shipping)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-base-content/50">
            No orders yet.{" "}
            <Link href="/products" className="text-primary hover:underline">
              Start shopping
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((order) => (
              <li
                key={order._id}
                className="rounded-sm border border-base-content/10 bg-base-200 p-4"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/50 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-medium capitalize text-primary">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 font-bold font-mono text-primary">
                  {formatPrice(order.total)}
                </p>
                <ul className="mt-2 text-sm text-base-content/50">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
                {order.invoiceId?.invoiceNumber && (
                  <p className="mt-2 text-xs font-mono text-primary">
                    Invoice: {order.invoiceId.invoiceNumber}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
