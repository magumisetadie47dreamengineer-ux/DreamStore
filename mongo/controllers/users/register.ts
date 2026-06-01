import { roleForNewUser } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import type { ControllerResponse, RegisterInput } from "./types";

export async function registerUser({
  name,
  email,
  password,
}: RegisterInput): Promise<ControllerResponse> {
  if (!name || !email || !password) {
    return { status: 400, body: { message: "All fields are required" } };
  }

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 409, body: { message: "Email already registered" } };
  }

  const role = roleForNewUser(email);
  const user = await User.create({ name, email, password, role });

  return {
    status: 201,
    body: {
      message: "User registered successfully",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
}
