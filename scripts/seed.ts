import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

async function main() {
  loadEnv();

  const { default: dbConnect } = await import("../lib/mongoose");
  const { syncSeedProducts } = await import("../lib/syncSeedProducts");
  const { default: Product } = await import("../mongo/models/Product");

  await dbConnect();

  const result = await syncSeedProducts({ force: true });
  const total = await Product.countDocuments();
  console.log(
    `Catalog sync done: ${result.inserted} new, ${result.imagesUpdated} updated, ${total} total products`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
