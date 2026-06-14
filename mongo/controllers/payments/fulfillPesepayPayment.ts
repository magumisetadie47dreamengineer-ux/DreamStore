import {
  checkPesepayPaymentStatus,
  isPesepayPaymentSuccessful,
} from "@/lib/pesepay/client";
import dbConnect from "@/lib/mongoose";
import { createOrder } from "@/mongo/controllers/orders/createOrder";
import Order from "@/mongo/models/Order";
import PendingPayment from "@/mongo/models/PendingPayment";

export async function fulfillPesepayPayment(referenceNumber: string) {
  await dbConnect();

  const existingOrder = await Order.findOne({ paynowReference: referenceNumber });
  if (existingOrder) {
    return {
      order: existingOrder,
      message: "Order already recorded",
      alreadyExists: true,
    };
  }

  const pending = await PendingPayment.findOne({ referenceNumber });
  if (!pending) {
    throw new Error("Pending payment not found");
  }

  if (pending.status === "fulfilled" && pending.orderId) {
    const order = await Order.findById(pending.orderId);
    if (order) {
      return {
        order,
        message: "Order already recorded",
        alreadyExists: true,
      };
    }
  }

  let transaction;
  try {
    transaction = await checkPesepayPaymentStatus(referenceNumber);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify payment";
    if (message.includes("decrypt")) {
      throw new Error(
        "Payment is still being confirmed. Please refresh your account page in a moment."
      );
    }
    throw error;
  }

  if (!isPesepayPaymentSuccessful(transaction)) {
    throw new Error(
      transaction.transactionStatusDescription ||
        "Payment not completed yet"
    );
  }

  const order = await createOrder(
    String(pending.userId),
    pending.items.map((item) => ({
      productId: String(item.productId),
      quantity: item.quantity,
    })),
    {
      method: "pesepay",
      reference: referenceNumber,
    }
  );

  pending.status = "fulfilled";
  pending.orderId = order._id;
  await pending.save();

  return {
    order,
    message: "Order placed successfully",
    alreadyExists: false,
  };
}
