import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import type { ControllerResponse } from "./types";

export async function deleteUser(id: string): Promise<ControllerResponse> {
  if (!id) {
    return { status: 400, body: { message: "User id is required" } };
  }

  await dbConnect();

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return { status: 404, body: { message: "User not found" } };
  }

  return {
    status: 200,
    body: { message: "User deleted successfully" },
  };
}
