import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import type { ControllerResponse, LoginInput } from "./types";

function userPayload(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  branchId?: unknown;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role || "buyer",
    branchId: user.branchId ? String(user.branchId) : undefined,
  };
}

export async function loginUser({
  email,
  password,
}: LoginInput): Promise<ControllerResponse> {
  if (!email || !password) {
    return {
      status: 400,
      body: { message: "Email and password are required" },
    };
  }

  await dbConnect();

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return { status: 401, body: { message: "Invalid email or password" } };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: 401, body: { message: "Invalid email or password" } };
  }

  return {
    status: 200,
    body: {
      message: "Login successful",
      user: userPayload(user),
    },
  };
}
