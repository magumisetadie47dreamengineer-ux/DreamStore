import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import { NextResponse } from "next/server";

const ASSIGNABLE = ["accounts", "buyer"];

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const { role, branchId } = await request.json();

    if (id === auth.user.id && role && role !== "admin") {
      return NextResponse.json(
        { message: "You cannot demote your own admin account" },
        { status: 400 }
      );
    }

    if (role && !ASSIGNABLE.includes(role) && role !== "admin") {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (role) user.role = role;
    if (branchId !== undefined) {
      user.branchId = branchId || undefined;
    }
    await user.save();

    return NextResponse.json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId ? String(user.branchId) : null,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}
