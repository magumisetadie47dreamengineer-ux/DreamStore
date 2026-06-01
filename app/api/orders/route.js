import { requireAuth } from "@/lib/auth/apiAuth";
import { createOrder } from "@/mongo/controllers/orders/createOrder";
import dbConnect from "@/lib/mongoose";
import Order from "@/mongo/models/Order";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, items } = await request.json();

    if (!userId || !items?.length) {
      return NextResponse.json(
        { message: "User and cart items are required" },
        { status: 400 }
      );
    }

    const order = await createOrder(userId, items);

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order: {
          id: order._id,
          total: order.total,
          status: order.status,
          items: order.items,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    await dbConnect();

    const filter = {};
    if (auth.user.role === "buyer") {
      filter.userId = new mongoose.Types.ObjectId(auth.user.id);
    } else if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("invoiceId", "invoiceNumber status total")
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
