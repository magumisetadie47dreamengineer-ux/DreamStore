import Product from "@/mongo/models/Product";
import { seedProducts } from "@/lib/seedProducts";

export async function syncSeedProducts() {
  let inserted = 0;
  for (const product of seedProducts) {
    const result = await Product.updateOne(
      { name: product.name },
      { $setOnInsert: product },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted += 1;
  }
  return inserted;
}
