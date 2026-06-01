import mongoose, { Model, Schema, Types, models } from "mongoose";

export interface IInvoiceLine {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface IInvoice {
  invoiceNumber: string;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  lines: IInvoiceLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "issued" | "void";
  issuedBy: Types.ObjectId;
  notes?: string;
}

const InvoiceLineSchema = new Schema<IInvoiceLine>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lines: { type: [InvoiceLineSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["issued", "void"], default: "issued" },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Invoice: Model<IInvoice> =
  models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
