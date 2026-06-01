"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { dashboardPathForRole } from "@/lib/auth/redirectByRole";
import { signOut } from "@/lib/auth/signOut";
import { useAuthStore } from "@/store/authStore";

export default function DashboardShell({ title, subtitle, children, allowedRoles }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return unsub;
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      router.replace(dashboardPathForRole(user?.role || "buyer"));
    }
  }, [hasHydrated, isAuthenticated, user, allowedRoles, router]);

  if (!hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-base-content/10 bg-base-200 px-4 py-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
              {brand.name} · {user.role}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-base-content/50 mt-1">{subtitle}</p>
            )}
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link href="/" className="btn btn-ghost btn-sm">
              Store
            </Link>
            {user.role === "admin" && (
              <Link href="/dashboard/admin" className="btn btn-ghost btn-sm">
                Admin
              </Link>
            )}
            {(user.role === "admin" || user.role === "accounts") && (
              <Link href="/dashboard/accounts" className="btn btn-ghost btn-sm">
                Finance & stock
              </Link>
            )}
            <Link href="/account" className="btn btn-ghost btn-sm">
              Profile
            </Link>
            <button
              type="button"
              onClick={() => signOut(router)}
              className="btn btn-outline btn-sm rounded-sm"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
