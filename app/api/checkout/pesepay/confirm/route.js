import { isPesepayConfigured } from "@/lib/pesepay/config";
import dbConnect from "@/lib/mongoose";
import { fulfillPesepayPayment } from "@/mongo/controllers/payments/fulfillPesepayPayment";
import PendingPayment from "@/mongo/models/PendingPayment";
import { NextResponse } from "next/server";

async function resolveReferenceNumber(referenceNumber, checkoutToken) {
  if (referenceNumber) return referenceNumber;

  if (!checkoutToken) {
    throw new Error("referenceNumber or checkoutToken is required");
  }

  await dbConnect();
  const pending = await PendingPayment.findOne({ checkoutToken });
  if (!pending?.referenceNumber) {
    throw new Error("Pending payment not found");
  }

  return pending.referenceNumber;
}

export async function POST(request) {
  try {
    if (!isPesepayConfigured()) {
      return NextResponse.json(
        { message: "Pesepay is not configured" },
        { status: 500 }
      );
    }

    const { referenceNumber, checkoutToken } = await request.json();
    const resolvedReference = await resolveReferenceNumber(
      referenceNumber,
      checkoutToken
    );

    const result = await fulfillPesepayPayment(resolvedReference);

    return NextResponse.json({
      message: result.message,
      order: {
        id: result.order._id,
        total: result.order.total,
        status: result.order.status,
        items: result.order.items,
      },
    });
  } catch (error) {
    console.error("Pesepay confirm error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to confirm order" },
      { status: 500 }
    );
  }
}
