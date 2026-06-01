import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import User from "@/mongo/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const users = await User.find({}, "name email role branchId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        branchId: u.branchId ? String(u.branchId) : null,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
