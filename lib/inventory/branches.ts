import Branch from "@/mongo/models/Branch";
import BranchInventory from "@/mongo/models/BranchInventory";
import Product from "@/mongo/models/Product";
import { logStockMovement } from "./logMovement";
import { syncProductStockFromBranches } from "./syncStock";

export async function ensureDefaultBranch() {
  let branch = await Branch.findOne({ isPrimary: true });
  if (branch) return branch;

  branch = await Branch.findOne({ code: "MAIN" });
  if (branch) {
    branch.isPrimary = true;
    await branch.save();
    return branch;
  }

  branch = await Branch.create({
    name: "Main Branch",
    code: "MAIN",
    address: "Head office",
    isActive: true,
    isPrimary: true,
  });

  return branch;
}

export async function seedBranchInventoryFromProducts(branchId: string) {
  const products = await Product.find({});
  for (const product of products) {
    const existing = await BranchInventory.findOne({
      branchId,
      productId: product._id,
    });
    if (!existing) {
      await BranchInventory.create({
        branchId,
        productId: product._id,
        quantity: product.stock,
        lowStockThreshold: 5,
      });
    }
  }
  await syncAllProductStockFromBranches();
}

async function syncAllProductStockFromBranches() {
  const products = await Product.find({}, "_id");
  for (const p of products) {
    await syncProductStockFromBranches(p._id);
  }
}

export async function getPrimaryBranch() {
  const branch = await Branch.findOne({ isPrimary: true, isActive: true });
  if (branch) return branch;
  return ensureDefaultBranch();
}

export async function deductBranchStock(
  productId: string,
  quantity: number,
  preferredBranchId?: string,
  orderId?: string
) {
  const tryBranch = async (branchId: string) => {
    const row = await BranchInventory.findOne({ branchId, productId });
    if (!row || row.quantity < quantity) return false;
    const quantityBefore = row.quantity;
    row.quantity -= quantity;
    await row.save();
    await logStockMovement({
      branchId,
      productId,
      quantityBefore,
      quantityAfter: row.quantity,
      reason: "sale",
      orderId,
    });
    await syncProductStockFromBranches(productId);
    return true;
  };

  if (preferredBranchId && (await tryBranch(preferredBranchId))) {
    return preferredBranchId;
  }

  const rows = await BranchInventory.find({ productId, quantity: { $gte: quantity } });
  if (rows.length === 0) {
    throw new Error("Insufficient branch inventory");
  }

  const primary = await getPrimaryBranch();
  const primaryRow = rows.find((r) => String(r.branchId) === String(primary._id));
  const target = primaryRow || rows[0];
  await tryBranch(String(target.branchId));
  return String(target.branchId);
}
