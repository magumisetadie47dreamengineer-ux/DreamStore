"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { dashboardPathForRole } from "@/lib/auth/redirectByRole";
import { signOut } from "@/lib/auth/signOut";
import { brand } from "@/lib/brand";
import { isStaffRole } from "@/lib/roles";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import CartIcon from "./icons/CartIcon";
import MobileNav from "./MobileNav";
import SearchBar from "./SearchBar";

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);
  const [hydrated, setHydrated] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setHydrated(true);
    setCartCount(getItemCount());
  }, [getItemCount]);

  useEffect(() => {
    const unsub = useCartStore.subscribe(() => {
      setCartCount(useCartStore.getState().getItemCount());
    });
    return unsub;
  }, []);

  return (
    <header className="navbar sticky top-0 z-50 border-b border-base-content/10 bg-base-100/95 backdrop-blur-md px-4 tech-grid-bg">
      <div className="navbar-start gap-1 relative">
        <MobileNav />
        <Link
          href="/"
          className="btn btn-ghost normal-case gap-2 px-2 hover:bg-base-200"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary bg-base-100 font-mono text-xs font-bold text-primary">
            DC
          </span>
          <div className="text-left hidden sm:block">
            <p className="text-base font-bold leading-tight tracking-tight">
              {brand.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/90">
              {brand.dreamChaser}
            </p>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 font-medium text-base-content/80">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="hover:text-primary">
              Shop
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="hover:text-primary">
              Contact
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end flex-1 justify-end gap-2 max-w-3xl">
        <Suspense fallback={null}>
          <SearchBar className="hidden sm:flex flex-1 justify-center max-w-xs" />
        </Suspense>

        <button
          type="button"
          onClick={openCartDrawer}
          className="btn btn-ghost btn-circle indicator border border-base-content/10 hover:border-primary/40 transition-colors"
          aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
        >
          <CartIcon className="size-6" />
          {hydrated && cartCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item font-mono min-w-[1.25rem]">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        <Link
          href="/checkout"
          className="btn btn-primary btn-sm hidden sm:flex rounded-sm font-semibold tracking-wide"
        >
          Checkout
        </Link>

        {hydrated && isAuthenticated ? (
          <>
            {user?.role && isStaffRole(user.role) && (
              <Link
                href={dashboardPathForRole(user.role)}
                className="btn btn-outline btn-sm rounded-sm border-base-content/20 hidden sm:inline-flex"
              >
                Dashboard
              </Link>
            )}
            <Link
              href={
                user?.role === "buyer"
                  ? "/account"
                  : dashboardPathForRole(user?.role)
              }
              className="btn btn-outline btn-sm rounded-sm border-base-content/20"
            >
              {user?.name?.split(" ")[0] || "Account"}
            </Link>
            <button
              type="button"
              onClick={() => signOut(router)}
              className="btn btn-ghost btn-sm hidden sm:inline-flex"
              aria-label="Log out"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="btn btn-ghost btn-sm hidden md:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn btn-primary btn-sm rounded-sm hidden sm:inline-flex"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
