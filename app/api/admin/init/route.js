import { requireAuth } from "@/lib/auth/apiAuth";
import {
  ensureDefaultBranch,
  seedBranchInventoryFromProducts,
} from "@/lib/inventory/branches";
import dbConnect from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const branch = await ensureDefaultBranch();
    await seedBranchInventoryFromProducts(String(branch._id));

    return NextResponse.json({
      message: "Branch and inventory initialized",
      branch: {
        id: branch._id,
        name: branch.name,
        code: branch.code,
      },
    });
  } catch (error) {
    console.error("Admin init error:", error);
    return NextResponse.json(
      { message: error.message || "Init failed" },
      { status: 500 }
    );
  }
}
