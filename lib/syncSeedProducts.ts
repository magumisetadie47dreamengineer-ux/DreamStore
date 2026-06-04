import Product from "@/mongo/models/Product";
import { seedProducts } from "@/lib/seedProducts";

type SyncResult = { inserted: number; imagesUpdated: number; skipped?: boolean };

let syncInFlight: Promise<SyncResult> | null = null;
let lastSyncAt = 0;

/** Re-sync at most once per interval (avoids blocking every page load). */
const SYNC_INTERVAL_MS =
  process.env.NODE_ENV === "development" ? 60_000 : 5 * 60_000;

async function runSync(): Promise<SyncResult> {
  let inserted = 0;
  let imagesUpdated = 0;

  const seedNames = seedProducts.map((p) => p.name);
  await Product.deleteMany({ name: { $nin: seedNames } });

  const bulkResult = await Product.bulkWrite(
    seedProducts.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: {
          $set: {
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category,
            featured: product.featured,
          },
          $setOnInsert: { stock: product.stock },
        },
        upsert: true,
      },
    }))
  );

  inserted = bulkResult.upsertedCount ?? 0;
  imagesUpdated = bulkResult.modifiedCount ?? 0;

  return { inserted, imagesUpdated };
}

export async function syncSeedProducts(options?: { force?: boolean }) {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && now - lastSyncAt < SYNC_INTERVAL_MS) {
    return { inserted: 0, imagesUpdated: 0, skipped: true };
  }

  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = runSync()
    .then((result) => {
      lastSyncAt = Date.now();
      return result;
    })
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}
