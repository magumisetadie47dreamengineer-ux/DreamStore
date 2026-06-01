import BranchInventory from "@/mongo/models/BranchInventory";
import Product from "@/mongo/models/Product";
import type { Types } from "mongoose";

export async function syncProductStockFromBranches(
  productId: Types.ObjectId | string
) {
  const rows = await BranchInventory.find({ productId });
  const total = rows.reduce((sum, r) => sum + r.quantity, 0);
  await Product.findByIdAndUpdate(productId, { stock: total });
  return total;
}

export async function syncAllProductStock() {
  const products = await Product.find({}, "_id").lean();
  for (const p of products) {
    await syncProductStockFromBranches(p._id);
  }
}
