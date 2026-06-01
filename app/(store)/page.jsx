import Link from "next/link";
import ContactSection from "@/components/store/ContactSection";
import HeroProductBackdrop from "@/components/store/HeroProductBackdrop";
import ProductCarousel from "@/components/store/ProductCarousel";
import ProductCard from "@/components/store/ProductCard";
import { brand } from "@/lib/brand";

async function getProducts(featuredOnly = false) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = featuredOnly
    ? `${baseUrl}/api/products?featured=true`
    : `${baseUrl}/api/products`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const [featured, allProducts] = await Promise.all([
    getProducts(true),
    getProducts(false),
  ]);

  const backdropProducts =
    featured.length > 0 ? featured : allProducts;

  return (
    <div>
      <section className="relative overflow-hidden min-h-[58vh] border-b border-base-content/10 bg-base-100">
        <HeroProductBackdrop products={backdropProducts} />
        <div className="hero relative z-10 min-h-[58vh]">
          <div className="hero-content flex-col text-center py-16 px-4 max-w-4xl">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.35em] text-base-content/50 mb-3">
              {brand.dreamChaser} · Tech
            </p>
            <span className="badge badge-outline border-primary/50 text-primary rounded-sm font-mono text-xs mb-4">
              {brand.name}
            </span>
            <p className="text-lg sm:text-xl font-medium italic text-primary mantra-glow max-w-2xl">
              &ldquo;{brand.mantra}&rdquo;
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-4xl text-base-content tracking-tight mt-6">
              Build your dream setup with{" "}
              <span className="text-primary">premium tech</span>
            </h1>
            <p className="max-w-2xl text-base-content/60 text-base sm:text-lg mt-4 leading-relaxed">
              {brand.mantraSub}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-10">
              <Link
                href="/products"
                className="btn btn-primary btn-lg rounded-sm px-8 font-semibold tracking-wide"
              >
                Shop tech
              </Link>
              <Link
                href="/cart"
                className="btn btn-outline btn-lg rounded-sm border-base-content/30 hover:border-primary hover:text-primary"
              >
                View cart
              </Link>
              <Link
                href="#contact"
                className="btn btn-ghost btn-lg rounded-sm text-base-content/70"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 border-b border-base-content/5">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-2">
            Featured
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Curated gear</h2>
          <p className="text-base-content/50 mt-2 max-w-lg mx-auto text-sm">
            Auto-rotating picks for dream chasers in the field
          </p>
        </div>

        <ProductCarousel products={featured} />

        <div className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Catalog</h2>
              <p className="text-base-content/50 text-sm mt-1 font-mono">
                {allProducts.length} products in catalog
              </p>
            </div>
            <Link
              href="/products"
              className="btn btn-outline btn-sm rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-content"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {allProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
