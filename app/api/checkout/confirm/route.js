import { getStripe } from "@/lib/stripe";
import { parseCheckoutItems } from "@/lib/stripe/parseCheckoutItems";
import { createOrder } from "@/mongo/controllers/orders/createOrder";
import dbConnect from "@/lib/mongoose";
import Order from "@/mongo/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { message: "sessionId is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json(
        { message: "Missing user in session metadata" },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return NextResponse.json({
        message: "Order already recorded",
        order: {
          id: existing._id,
          total: existing.total,
          status: existing.status,
        },
      });
    }

    const lineItems = session.line_items?.data || [];
    const items = parseCheckoutItems(session, lineItems);

    if (!items.length) {
      return NextResponse.json(
        { message: "No valid line items in session" },
        { status: 400 }
      );
    }

    const order = await createOrder(userId, items, sessionId);

    return NextResponse.json({
      message: "Order placed successfully",
      order: {
        id: order._id,
        total: order.total,
        status: order.status,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Checkout confirm error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to confirm order" },
      { status: 500 }
    );
  }
}
