import { requireAuth } from "@/lib/auth/apiAuth";
import { logStockMovement } from "@/lib/inventory/logMovement";
import { syncProductStockFromBranches } from "@/lib/inventory/syncStock";
import dbConnect from "@/lib/mongoose";
import BranchInventory from "@/mongo/models/BranchInventory";
import Product from "@/mongo/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const lowStock = searchParams.get("lowStock") === "true";

    await dbConnect();

    const filter = {};
    if (branchId) filter.branchId = branchId;

    let rows = await BranchInventory.find(filter)
      .populate("productId", "name price image category stock")
      .populate("branchId", "name code")
      .lean();

    if (lowStock) {
      rows = rows.filter(
        (r) => r.quantity <= (r.lowStockThreshold ?? 5)
      );
    }

    const updatedAt = rows.length
      ? Math.max(...rows.map((r) => new Date(r.updatedAt).getTime()))
      : Date.now();

    return NextResponse.json({ rows, updatedAt });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    const { branchId, productId, quantity, lowStockThreshold, adjustment } =
      await request.json();

    if (!branchId || !productId) {
      return NextResponse.json(
        { message: "branchId and productId are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let row = await BranchInventory.findOne({ branchId, productId });

    if (!row) {
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      row = await BranchInventory.create({
        branchId,
        productId,
        quantity: 0,
        lowStockThreshold: 5,
      });
    }

    const quantityBefore = row.quantity;

    if (quantity !== undefined) {
      row.quantity = Math.max(0, Number(quantity));
    } else if (adjustment !== undefined) {
      row.quantity = Math.max(0, row.quantity + Number(adjustment));
    }

    if (lowStockThreshold !== undefined) {
      row.lowStockThreshold = Math.max(0, Number(lowStockThreshold));
    }

    const quantityChanged = row.quantity !== quantityBefore;

    await row.save();

    if (quantityChanged) {
      const delta = row.quantity - quantityBefore;
      await logStockMovement({
        branchId,
        productId,
        quantityBefore,
        quantityAfter: row.quantity,
        reason: delta > 0 ? "restock" : "adjustment",
        userId: auth.user.id,
      });
    }
    const totalStock = await syncProductStockFromBranches(productId);

    const populated = await BranchInventory.findById(row._id)
      .populate("productId", "name price image category stock")
      .populate("branchId", "name code")
      .lean();

    return NextResponse.json({ row: populated, totalStock });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update inventory" },
      { status: 500 }
    );
  }
}
