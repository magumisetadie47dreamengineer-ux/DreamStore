import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import type { ControllerResponse, UpdateInput } from "./types";

export async function updateUser(
  id: string,
  updates: UpdateInput
): Promise<ControllerResponse> {
  if (!id) {
    return { status: 400, body: { message: "User id is required" } };
  }

  const { name, email, password } = updates;
  if (!name && !email && !password) {
    return {
      status: 400,
      body: { message: "At least one field is required to update" },
    };
  }

  await dbConnect();

  const user = await User.findById(id).select("+password");
  if (!user) {
    return { status: 404, body: { message: "User not found" } };
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;

  try {
    await user.save();
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { status: 409, body: { message: "Email already in use" } };
    }
    throw error;
  }

  return {
    status: 200,
    body: {
      message: "User updated successfully",
      user: { id: user._id, name: user.name, email: user.email },
    },
  };
}
