import {
  ensureDefaultBranch,
  seedBranchInventoryFromProducts,
} from "@/lib/inventory/branches";
import dbConnect from "@/lib/mongoose";
import { syncSeedProducts } from "@/lib/syncSeedProducts";
import BranchInventory from "@/mongo/models/BranchInventory";
import Product from "@/mongo/models/Product";

export type ProductListFilters = {
  category?: string;
  featured?: boolean;
};

/** Load products from MongoDB (use in Server Components — avoids self-fetch to /api). */
export async function getProductsServer(filters: ProductListFilters = {}) {
  await dbConnect();

  await syncSeedProducts();

  try {
    const branch = await ensureDefaultBranch();
    const invCount = await BranchInventory.countDocuments({
      branchId: branch._id,
    });
    if (invCount === 0) {
      await seedBranchInventoryFromProducts(String(branch._id));
    }
  } catch (err) {
    console.error("Branch inventory seed skipped:", err);
  }

  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.featured) query.featured = true;

  const products = await Product.find(query).sort({ createdAt: -1 }).lean();

  return JSON.parse(JSON.stringify(products));
}

export async function getProductByIdServer(id: string) {
  await dbConnect();
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return JSON.parse(JSON.stringify(product));
}
