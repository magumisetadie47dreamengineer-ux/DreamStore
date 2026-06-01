import Link from "next/link";
import { brand } from "@/lib/brand";
import ContactInfo from "./ContactInfo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-base-content/10 bg-base-200 tech-grid-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 pb-8 border-b border-base-content/10">
          <p className="text-primary font-medium italic text-lg">
            &ldquo;{brand.mantra}&rdquo;
          </p>
          <p className="text-sm text-base-content/50 mt-2 font-mono uppercase tracking-widest">
            {brand.dreamChaser} · Tech Field
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary font-mono text-sm font-bold text-primary">
                DC
              </span>
              <div>
                <p className="font-bold text-lg tracking-tight">{brand.name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
                  {brand.dreamChaser}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-base-content/55 leading-relaxed">
              {brand.tagline}
            </p>
          </aside>

          <nav>
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
              Navigate
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-base-content/70">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary">
                  Shop all
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-primary">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>

          <nav>
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
              Categories
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-base-content/55">
              <li>Laptops & Tablets</li>
              <li>Gadgets & Drones</li>
              <li>Audio & Streaming</li>
              <li>Smart Home & Wearables</li>
            </ul>
          </nav>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
              Contact
            </h3>
            <ContactInfo compact />
          </div>
        </div>

        <p className="text-center text-xs text-base-content/40 mt-10 font-mono">
          © {new Date().getFullYear()} {brand.name} · {brand.dreamChaser}
        </p>
      </div>
    </footer>
  );
}
