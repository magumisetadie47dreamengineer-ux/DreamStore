import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import Branch from "@/mongo/models/Branch";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    if (body.isPrimary) {
      await Branch.updateMany({ _id: { $ne: id } }, { isPrimary: false });
    }

    const branch = await Branch.findByIdAndUpdate(
      id,
      {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code.toUpperCase() }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isPrimary !== undefined && { isPrimary: body.isPrimary }),
      },
      { new: true }
    );

    if (!branch) {
      return NextResponse.json({ message: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to update branch" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    await dbConnect();
    const branch = await Branch.findById(id);
    if (!branch) {
      return NextResponse.json({ message: "Branch not found" }, { status: 404 });
    }
    if (branch.isPrimary) {
      return NextResponse.json(
        { message: "Cannot delete primary branch" },
        { status: 400 }
      );
    }
    branch.isActive = false;
    await branch.save();
    return NextResponse.json({ message: "Branch deactivated" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to delete branch" },
      { status: 500 }
    );
  }
}
