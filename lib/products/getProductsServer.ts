import dbConnect from "@/lib/mongoose";
import Product from "@/mongo/models/Product";

export type ProductListFilters = {
  category?: string;
  featured?: boolean;
};

/** Hard cap so store pages still render if Atlas is slow on a cold start. */
const LOAD_TIMEOUT_MS =
  process.env.NODE_ENV === "production" ? 9000 : 30000;

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out`)),
          LOAD_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Load products from MongoDB (use in Server Components — avoids self-fetch to /api). */
export async function getProductsServer(filters: ProductListFilters = {}) {
  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.featured) query.featured = true;

  try {
    await withTimeout(dbConnect(), "Database connection");
    const products = await withTimeout(
      Product.find(query).sort({ createdAt: -1 }).lean(),
      "Product query"
    );
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("getProductsServer failed:", error);
    return [];
  }
}

export async function getProductByIdServer(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("getProductByIdServer failed:", error);
    return null;
  }
}
