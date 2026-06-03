import {
  ensureDefaultBranch,
  seedBranchInventoryFromProducts,
} from "@/lib/inventory/branches";
import dbConnect from "@/lib/mongoose";
import { syncSeedProducts } from "@/lib/syncSeedProducts";
import BranchInventory from "@/mongo/models/BranchInventory";
import Product from "@/mongo/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    try {
      await syncSeedProducts();
    } catch (syncErr) {
      console.error("syncSeedProducts:", syncErr);
    }

    try {
      const branch = await ensureDefaultBranch();
      const invCount = await BranchInventory.countDocuments({
        branchId: branch._id,
      });
      if (invCount === 0) {
        await seedBranchInventoryFromProducts(String(branch._id));
      }
    } catch (branchErr) {
      console.error("Branch inventory seed:", branchErr);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
