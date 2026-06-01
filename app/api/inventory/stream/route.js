import { requireAuth } from "@/lib/auth/apiAuth";
import dbConnect from "@/lib/mongoose";
import BranchInventory from "@/mongo/models/BranchInventory";
export const dynamic = "force-dynamic";

async function fetchInventoryPayload(branchId) {
  await dbConnect();
  const filter = branchId ? { branchId } : {};
  const rows = await BranchInventory.find(filter)
    .populate("productId", "name price image category stock")
    .populate("branchId", "name code")
    .lean();

  const updatedAt = rows.length
    ? Math.max(...rows.map((r) => new Date(r.updatedAt).getTime()))
    : Date.now();

  return { rows, updatedAt };
}

export async function GET(request) {
  const auth = await requireAuth(request, ["admin", "accounts"]);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastSignature = "";

      const send = async () => {
        try {
          const { rows, updatedAt } = await fetchInventoryPayload(branchId);
          const signature = `${updatedAt}:${rows.length}:${rows
            .map((r) => `${r._id}:${r.quantity}`)
            .join(",")}`;

          if (signature !== lastSignature) {
            lastSignature = signature;
            const payload = JSON.stringify({ rows, updatedAt });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          controller.enqueue(encoder.encode(`data: {"error":true}\n\n`));
        }
      };

      await send();
      const interval = setInterval(send, 1000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
