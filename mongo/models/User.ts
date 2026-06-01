import bcrypt from "bcryptjs";
import mongoose, { Model, Schema, Types, models } from "mongoose";
import type { UserRole } from "@/lib/roles";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "accounts", "buyer"],
      default: "buyer",
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

const User: Model<IUser> =
  models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
