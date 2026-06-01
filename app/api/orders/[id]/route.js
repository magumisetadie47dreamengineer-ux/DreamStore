import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import Order from "@/mongo/models/Order";
import { NextResponse } from "next/server";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await dbConnect();

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("invoiceId")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (
      auth.user.role === "buyer" &&
      String(order.userId?._id || order.userId) !== auth.user.id
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const { status, adminNotes } = await request.json();

    if (status && !STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (status) order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    order.processedBy = auth.user.id;
    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
