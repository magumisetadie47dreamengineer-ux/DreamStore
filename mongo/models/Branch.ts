import mongoose, { Model, Schema, models } from "mongoose";

export interface IBranch {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  isPrimary: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Branch: Model<IBranch> =
  models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);

export default Branch;
