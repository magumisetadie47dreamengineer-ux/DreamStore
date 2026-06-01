import { requireAuth } from "@/lib/auth/apiAuth";
import { createInvoiceForOrder } from "@/mongo/controllers/invoices/createInvoice";
import dbConnect from "@/lib/mongoose";
import Invoice from "@/mongo/models/Invoice";
import { NextResponse } from "next/server";

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    await dbConnect();

    const filter = {};
    if (auth.user.role === "buyer") {
      filter.userId = auth.user.id;
    } else if (userId) {
      filter.userId = userId;
    }
    if (orderId) filter.orderId = orderId;

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .populate("orderId", "status total")
      .lean();

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth.error) return auth.error;

  try {
    const { orderId, notes } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { message: "orderId is required" },
        { status: 400 }
      );
    }

    const invoice = await createInvoiceForOrder(
      orderId,
      auth.user.id,
      notes
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
