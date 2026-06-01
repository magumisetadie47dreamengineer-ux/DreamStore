import mongoose, { Model, Schema, models } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
