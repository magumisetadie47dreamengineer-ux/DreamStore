import { getSiteUrl } from "@/lib/site";
import { getShippingCost } from "@/lib/shipping";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { message: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env" },
        { status: 500 }
      );
    }

    const { items, userId, userEmail } = await request.json();

    if (!userId || !items?.length) {
      return NextResponse.json(
        { message: "User and cart items are required" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? getSiteUrl()
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = getShippingCost(subtotal);

    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          metadata: {
            productId: String(item.productId),
          },
        },
      },
    }));

    if (shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shipping * 100),
          product_data: { name: "Shipping" },
        },
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail,
      line_items: lineItems,
      metadata: {
        userId: String(userId),
        cartItems: JSON.stringify(
          items.map((item) => ({
            productId: String(item.productId),
            quantity: item.quantity,
          }))
        ),
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
