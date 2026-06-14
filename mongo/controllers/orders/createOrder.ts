import { getShippingCost } from "@/lib/shipping";
import { deductBranchStock, getPrimaryBranch } from "@/lib/inventory/branches";
import dbConnect from "@/lib/mongoose";
import Order from "@/mongo/models/Order";
import Product from "@/mongo/models/Product";

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayment = {
  stripeSessionId?: string;
  method?: string;
  reference?: string;
};

export async function createOrder(
  userId: string,
  items: OrderItemInput[],
  payment?: CreateOrderPayment | string
) {
  const paymentDetails =
    typeof payment === "string" ? { stripeSessionId: payment } : payment;
  const isPaid = Boolean(
    paymentDetails?.stripeSessionId || paymentDetails?.reference
  );
  await dbConnect();

  const primaryBranch = await getPrimaryBranch();
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }

  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  const order = await Order.create({
    userId,
    items: orderItems,
    subtotal,
    shipping,
    total,
    status: isPaid ? "paid" : "pending",
    branchId: primaryBranch._id,
    ...(paymentDetails?.stripeSessionId
      ? { stripeSessionId: paymentDetails.stripeSessionId }
      : {}),
    ...(paymentDetails?.method ? { paymentMethod: paymentDetails.method } : {}),
    ...(paymentDetails?.reference
      ? { paynowReference: paymentDetails.reference }
      : {}),
  });

  for (const item of orderItems) {
    await deductBranchStock(
      String(item.productId),
      item.quantity,
      String(primaryBranch._id),
      String(order._id)
    );
  }

  return order;
}
