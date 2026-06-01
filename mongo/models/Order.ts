import mongoose, { Model, Schema, Types, models } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrder {
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  stripeSessionId?: string;
  paymentMethod?: string;
  paynowReference?: string;
  branchId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  processedBy?: Types.ObjectId;
  adminNotes?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    stripeSessionId: { type: String },
    paymentMethod: { type: String },
    paynowReference: { type: String },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
