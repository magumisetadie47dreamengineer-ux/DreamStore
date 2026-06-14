import { randomUUID } from "crypto";
import { getCheckoutBaseUrl } from "@/lib/checkout/baseUrl";
import { getShippingCost } from "@/lib/shipping";
import {
  getPesepayCurrency,
  isPesepayConfigured,
} from "@/lib/pesepay/config";
import { initiatePesepayTransaction } from "@/lib/pesepay/client";
import dbConnect from "@/lib/mongoose";
import PendingPayment from "@/mongo/models/PendingPayment";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!isPesepayConfigured()) {
      return NextResponse.json(
        {
          message:
            "Pesepay is not configured. Add PESEPAY_INTEGRATION_KEY and PESEPAY_ENCRYPTION_KEY to .env",
        },
        { status: 500 }
      );
    }

    const { items, userId } = await request.json();

    if (!userId || !items?.length) {
      return NextResponse.json(
        { message: "User and cart items are required" },
        { status: 400 }
      );
    }

    const baseUrl = getCheckoutBaseUrl();
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = getShippingCost(subtotal);
    const total = subtotal + shipping;
    const currencyCode = getPesepayCurrency();
    const checkoutToken = randomUUID();

    const transaction = await initiatePesepayTransaction({
      amount: total,
      currencyCode,
      reasonForPayment: "DreamStore order",
      resultUrl: `${baseUrl}/api/checkout/pesepay/result`,
      returnUrl: `${baseUrl}/checkout/success?payment=pesepay&token=${checkoutToken}`,
    });

    if (!transaction.referenceNumber || !transaction.redirectUrl) {
      return NextResponse.json(
        { message: "Pesepay did not return a payment link" },
        { status: 502 }
      );
    }

    await dbConnect();
    await PendingPayment.create({
      userId,
      checkoutToken,
      referenceNumber: transaction.referenceNumber,
      pollUrl: transaction.pollUrl,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      amount: total,
      currencyCode,
      status: "pending",
    });

    return NextResponse.json({
      url: transaction.redirectUrl,
      referenceNumber: transaction.referenceNumber,
      checkoutToken,
    });
  } catch (error) {
    console.error("Pesepay checkout error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to start Pesepay checkout" },
      { status: 500 }
    );
  }
}
