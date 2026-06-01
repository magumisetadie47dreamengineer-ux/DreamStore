import mongoose, { Model, Schema, Types, models } from "mongoose";

export type StockMovementReason =
  | "adjustment"
  | "sale"
  | "restock"
  | "pre_stock";

export interface IStockMovement {
  branchId: Types.ObjectId;
  productId: Types.ObjectId;
  quantityBefore: number;
  quantityAfter: number;
  change: number;
  reason: StockMovementReason;
  userId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  /** Expected arrival date for pre-stock entries */
  scheduledDate?: Date;
  note?: string;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantityBefore: { type: Number, required: true, min: 0 },
    quantityAfter: { type: Number, required: true, min: 0 },
    change: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["adjustment", "sale", "restock", "pre_stock"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    scheduledDate: { type: Date },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

StockMovementSchema.index({ branchId: 1, createdAt: -1 });
StockMovementSchema.index({ productId: 1, createdAt: -1 });
StockMovementSchema.index({ scheduledDate: 1 });

const StockMovement: Model<IStockMovement> =
  models.StockMovement ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);

export default StockMovement;
