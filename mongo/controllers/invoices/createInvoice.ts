import dbConnect from "@/lib/mongoose";
import Invoice from "@/mongo/models/Invoice";
import Order from "@/mongo/models/Order";

function nextInvoiceNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${y}${m}${day}-${rand}`;
}

export async function createInvoiceForOrder(
  orderId: string,
  issuedByUserId: string,
  notes?: string
) {
  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.invoiceId) throw new Error("Invoice already issued for this order");

  const lines = order.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
  }));

  const subtotal =
    order.subtotal ??
    order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.shipping ?? 0;
  const total = order.total ?? subtotal + shipping;

  const invoice = await Invoice.create({
    invoiceNumber: nextInvoiceNumber(),
    orderId: order._id,
    userId: order.userId,
    lines,
    subtotal,
    shipping,
    total,
    status: "issued",
    issuedBy: issuedByUserId,
    notes,
  });

  order.invoiceId = invoice._id;
  if (order.status === "paid") order.status = "processing";
  order.processedBy = issuedByUserId as never;
  await order.save();

  return invoice;
}
