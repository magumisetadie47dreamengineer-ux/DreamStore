import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import Branch from "@/mongo/models/Branch";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const branches = await Branch.find().sort({ isPrimary: -1, name: 1 }).lean();
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, code, address, phone, isPrimary } = body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Name and code are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    if (isPrimary) {
      await Branch.updateMany({}, { isPrimary: false });
    }

    const branch = await Branch.create({
      name,
      code: code.toUpperCase(),
      address,
      phone,
      isPrimary: Boolean(isPrimary),
      isActive: true,
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create branch" },
      { status: 500 }
    );
  }
}
