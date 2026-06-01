import mongoose, { Model, Schema, Types, models } from "mongoose";

export interface IBranchInventory {
  branchId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  lowStockThreshold: number;
}

const BranchInventorySchema = new Schema<IBranchInventory>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true }
);

BranchInventorySchema.index({ branchId: 1, productId: 1 }, { unique: true });

const BranchInventory: Model<IBranchInventory> =
  models.BranchInventory ||
  mongoose.model<IBranchInventory>("BranchInventory", BranchInventorySchema);

export default BranchInventory;
