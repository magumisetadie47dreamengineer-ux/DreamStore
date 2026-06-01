import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import BranchInventory from "@/mongo/models/BranchInventory";
import Order from "@/mongo/models/Order";
import Product from "@/mongo/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") || 30);
    const since = new Date();
    since.setDate(since.getDate() - days);

    await dbConnect();

    const orders = await Order.find({
      status: { $in: ["paid", "processing", "shipped", "delivered"] },
      createdAt: { $gte: since },
    }).lean();

    let revenue = 0;
    let estimatedCost = 0;

    for (const order of orders) {
      revenue += order.total;
      for (const item of order.items) {
        const product = await Product.findById(item.productId).lean();
        const unitCost =
          product?.costPrice ?? product?.price ? product.price * 0.65 : item.price * 0.65;
        estimatedCost += unitCost * item.quantity;
      }
    }

    const grossProfit = revenue - estimatedCost;
    const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const inventoryRows = await BranchInventory.find({}).populate(
      "productId",
      "price costPrice"
    );
    let inventoryValue = 0;
    for (const row of inventoryRows) {
      const p = row.productId;
      if (!p || typeof p !== "object") continue;
      const val = p.costPrice ?? p.price * 0.65;
      inventoryValue += val * row.quantity;
    }

    const lowStockCount = inventoryRows.filter(
      (r) => r.quantity <= (r.lowStockThreshold ?? 5)
    ).length;

    return NextResponse.json({
      periodDays: days,
      orderCount: orders.length,
      revenue,
      estimatedCost,
      grossProfit,
      marginPct,
      inventoryValue,
      lowStockCount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to build report" },
      { status: 500 }
    );
  }
}
