import {
  isPesepayPaymentSuccessful,
  parsePesepayWebhookPayload,
} from "@/lib/pesepay/client";
import { isPesepayConfigured } from "@/lib/pesepay/config";
import { fulfillPesepayPayment } from "@/mongo/controllers/payments/fulfillPesepayPayment";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (!isPesepayConfigured()) {
      return NextResponse.json(
        { message: "Pesepay is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    if (!body?.payload) {
      return NextResponse.json(
        { message: "Missing encrypted payload" },
        { status: 400 }
      );
    }

    const transaction = parsePesepayWebhookPayload(body.payload);
    const referenceNumber = transaction.referenceNumber;

    if (!referenceNumber) {
      return NextResponse.json(
        { message: "Missing transaction reference" },
        { status: 400 }
      );
    }

    if (!isPesepayPaymentSuccessful(transaction)) {
      return NextResponse.json({
        message: "Payment not successful yet",
        status: transaction.transactionStatus,
      });
    }

    await fulfillPesepayPayment(referenceNumber);

    return NextResponse.json({ message: "Payment recorded" });
  } catch (error) {
    console.error("Pesepay result webhook error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process payment result" },
      { status: 500 }
    );
  }
}
