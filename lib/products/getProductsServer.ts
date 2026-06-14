import dbConnect from "@/lib/mongoose";
import Product from "@/mongo/models/Product";

export type ProductListFilters = {
  category?: string;
  featured?: boolean;
};

/** Load products from MongoDB (use in Server Components — avoids self-fetch to /api). */
export async function getProductsServer(filters: ProductListFilters = {}) {
  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.featured) query.featured = true;

  try {
    await dbConnect();
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
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
