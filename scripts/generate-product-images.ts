import fs from "fs";
import path from "path";
import { productImageSlug, PRODUCT_IMAGE_FALLBACK } from "../lib/productImage";
import {
  downloadProductImage,
  findProductImage,
} from "../lib/productImageSearch";
import { seedCatalog } from "../lib/seedProducts";

const outDir = path.join(process.cwd(), "public", "products");
const cachePath = path.join(outDir, ".image-cache.json");

const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Product">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect x="140" y="200" width="520" height="360" rx="28" fill="#fff" stroke="#cbd5e1" stroke-width="3"/>
  <rect x="200" y="260" width="400" height="240" rx="12" fill="#f1f5f9"/>
  <circle cx="400" cy="380" r="48" fill="#e2e8f0"/>
  <path d="M320 520h160" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
</svg>`;

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      process.env[trimmed.slice(0, eq).trim()] = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
}

type ImageCache = Record<
  string,
  { url: string; source: string; query: string; title: string }
>;

function loadCache(): ImageCache {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8")) as ImageCache;
  } catch {
    return {};
  }
}

function cleanupOldAssets() {
  for (const file of fs.readdirSync(outDir)) {
    if (
      file.endsWith(".svg") &&
      file !== "placeholder.svg" &&
      file !== "manifest.json"
    ) {
      fs.unlinkSync(path.join(outDir, file));
    }
  }
}

async function main() {
  loadEnv();
  const force = process.argv.includes("--force");
  const pexelsApiKey = process.env.PEXELS_API_KEY;

  fs.mkdirSync(outDir, { recursive: true });
  cleanupOldAssets();
  fs.writeFileSync(path.join(outDir, "placeholder.svg"), PLACEHOLDER_SVG, "utf8");

  const cache = loadCache();
  const manifest: Record<string, string> = {
    placeholder: PRODUCT_IMAGE_FALLBACK,
  };

  let fetched = 0;
  let cached = 0;
  let failed = 0;

  console.log(
    "Searching Wikimedia Commons + Openverse" +
      (pexelsApiKey ? " + Pexels" : "") +
      " (use --force to re-download)…\n"
  );

  const retryFailed = process.argv.includes("--retry-failed");

  for (const product of seedCatalog) {
    const slug = productImageSlug(product.name);
    const localFile = `${slug}.jpg`;
    const localPath = path.join(outDir, localFile);
    const publicPath = `/products/${localFile}`;

    if (retryFailed && fs.existsSync(localPath)) {
      manifest[slug] = publicPath;
      cached++;
      continue;
    }

    if (!force && fs.existsSync(localPath) && cache[slug]) {
      manifest[slug] = publicPath;
      cached++;
      continue;
    }

    process.stdout.write(`  ${product.name.slice(0, 52).padEnd(52)} `);

    const hit = await findProductImage(product.name, product.category, {
      pexelsApiKey,
    });

    if (!hit) {
      console.log("— no match");
      failed++;
      if (fs.existsSync(localPath)) {
        manifest[slug] = publicPath;
      }
      continue;
    }

    const ok = await downloadProductImage(hit.url, localPath);
    if (!ok) {
      console.log(`— download failed (${hit.source})`);
      failed++;
      continue;
    }

    cache[slug] = {
      url: hit.url,
      source: hit.source,
      query: hit.query,
      title: hit.title,
    };
    manifest[slug] = publicPath;
    fetched++;
    console.log(`✓ ${hit.source}: ${hit.title.slice(0, 40)}`);
  }

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(
    `\nDone: ${fetched} fetched, ${cached} cached, ${failed} without new image, ${seedCatalog.length} total`
  );
  if (!pexelsApiKey) {
    console.log(
      "Tip: add PEXELS_API_KEY to .env for an extra fallback source (free at pexels.com/api)"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
