import fs from "fs";
import path from "path";
import { PRODUCT_IMAGE_FALLBACK, productImageSlug } from "./productImage";

type Manifest = Record<string, string>;

let manifestCache: Manifest | null = null;

function loadManifest(): Manifest {
  if (manifestCache) return manifestCache;

  const manifestPath = path.join(
    process.cwd(),
    "public",
    "products",
    "manifest.json"
  );

  if (fs.existsSync(manifestPath)) {
    manifestCache = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Manifest;
    return manifestCache;
  }

  manifestCache = {};
  return manifestCache;
}

/** Resolve product image URL from manifest or category photo pool. */
export function productImageUrl(nameOrSlug: string, category?: string) {
  const slug = nameOrSlug.includes(" ")
    ? productImageSlug(nameOrSlug)
    : nameOrSlug;

  const manifest = loadManifest();
  if (manifest[slug]) return manifest[slug];

  const localJpg = path.join(process.cwd(), "public", "products", `${slug}.jpg`);
  if (fs.existsSync(localJpg)) return `/products/${slug}.jpg`;

  return PRODUCT_IMAGE_FALLBACK;
}

export function isProductImageMapped(name: string) {
  const slug = productImageSlug(name);
  const manifest = loadManifest();
  return (
    slug in manifest ||
    fs.existsSync(path.join(process.cwd(), "public", "products", `${slug}.jpg`))
  );
}
