import mongoose, { Model, Schema, Types } from "mongoose";

export type PendingPaymentStatus = "pending" | "fulfilled" | "failed";

export interface IPendingPaymentItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IPendingPayment {
  userId: Types.ObjectId;
  items: IPendingPaymentItem[];
  checkoutToken: string;
  referenceNumber?: string;
  pollUrl?: string;
  amount: number;
  currencyCode: string;
  status: PendingPaymentStatus;
  orderId?: Types.ObjectId;
}

const PendingPaymentItemSchema = new Schema<IPendingPaymentItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PendingPaymentSchema = new Schema<IPendingPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [PendingPaymentItemSchema], required: true },
    checkoutToken: { type: String, required: true, unique: true, index: true },
    referenceNumber: { type: String, unique: true, sparse: true, index: true },
    pollUrl: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currencyCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "failed"],
      default: "pending",
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

PendingPaymentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

if (mongoose.models.PendingPayment) {
  delete mongoose.models.PendingPayment;
}

const PendingPayment: Model<IPendingPayment> = mongoose.model<IPendingPayment>(
  "PendingPayment",
  PendingPaymentSchema
);

export default PendingPayment;
