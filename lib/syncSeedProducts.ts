import Product from "@/mongo/models/Product";
import { seedProducts } from "@/lib/seedProducts";

export async function syncSeedProducts() {
  let inserted = 0;
  let imagesUpdated = 0;

  const seedNames = seedProducts.map((p) => p.name);
  await Product.deleteMany({ name: { $nin: seedNames } });

  for (const product of seedProducts) {
    const result = await Product.updateOne(
      { name: product.name },
      {
        $set: {
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          featured: product.featured,
        },
        $setOnInsert: { stock: product.stock },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted += 1;
    else if (result.modifiedCount > 0) imagesUpdated += 1;
  }

  return { inserted, imagesUpdated };
}
