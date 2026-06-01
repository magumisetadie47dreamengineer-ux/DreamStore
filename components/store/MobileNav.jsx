"use client";

import Link from "next/link";
import { useState } from "react";
import { useUiStore } from "@/store/uiStore";
import CartIcon from "./icons/CartIcon";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const openCartDrawer = useUiStore((s) => s.openCartDrawer);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5"
        >
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
          ) : (
            <>
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <ul className="menu absolute left-0 right-0 top-full z-50 border-b border-base-content/10 bg-base-100 px-4 py-3 shadow-lg">
          <li>
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" onClick={() => setOpen(false)}>
              Shop
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => {
                setOpen(false);
                openCartDrawer();
              }}
            >
              <CartIcon className="size-4" />
              Cart
            </button>
          </li>
          <li>
            <Link href="/#contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </li>
          <li>
            <Link href="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
