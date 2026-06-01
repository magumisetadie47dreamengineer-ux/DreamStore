import { requireAuth } from "@/lib/auth/apiAuth";
import { logStockMovement } from "@/lib/inventory/logMovement";
import dbConnect from "@/lib/mongoose";
import BranchInventory from "@/mongo/models/BranchInventory";
import StockMovement from "@/mongo/models/StockMovement";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const productId = searchParams.get("productId");
    const reason = searchParams.get("reason");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await dbConnect();

    const filter = {};
    if (branchId) filter.branchId = branchId;
    if (productId) filter.productId = productId;
    if (reason) filter.reason = reason;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("productId", "name category")
      .populate("branchId", "name code")
      .populate("userId", "name email")
      .lean();

    return NextResponse.json({ movements });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch stock history" },
      { status: 500 }
    );
  }
}

/** Log incoming pre-stock with an expected date */
export async function POST(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    const { branchId, productId, incomingQty, scheduledDate, note } =
      await request.json();

    if (!branchId || !productId || !incomingQty || !scheduledDate) {
      return NextResponse.json(
        {
          message:
            "branchId, productId, incomingQty, and scheduledDate are required",
        },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(incomingQty));
    const date = new Date(scheduledDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { message: "Invalid scheduledDate" },
        { status: 400 }
      );
    }

    await dbConnect();

    let row = await BranchInventory.findOne({ branchId, productId });
    if (!row) {
      row = await BranchInventory.create({
        branchId,
        productId,
        quantity: 0,
        lowStockThreshold: 5,
      });
    }

    const quantityBefore = row.quantity;
    const quantityAfter = quantityBefore + qty;

    const movement = await logStockMovement({
      branchId,
      productId,
      quantityBefore,
      quantityAfter,
      reason: "pre_stock",
      userId: auth.user.id,
      scheduledDate: date,
      note,
    });

    const populated = await StockMovement.findById(movement._id)
      .populate("productId", "name category")
      .populate("branchId", "name code")
      .populate("userId", "name email")
      .lean();

    return NextResponse.json({ movement: populated }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to log pre-stock" },
      { status: 500 }
    );
  }
}
