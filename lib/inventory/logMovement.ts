import StockMovement, {
  type StockMovementReason,
} from "@/mongo/models/StockMovement";
import type { Types } from "mongoose";

type LogMovementInput = {
  branchId: Types.ObjectId | string;
  productId: Types.ObjectId | string;
  quantityBefore: number;
  quantityAfter: number;
  reason: StockMovementReason;
  userId?: Types.ObjectId | string;
  orderId?: Types.ObjectId | string;
  scheduledDate?: Date;
  note?: string;
};

export async function logStockMovement(input: LogMovementInput) {
  const quantityBefore = Math.max(0, input.quantityBefore);
  const quantityAfter = Math.max(0, input.quantityAfter);

  return StockMovement.create({
    branchId: input.branchId,
    productId: input.productId,
    quantityBefore,
    quantityAfter,
    change: quantityAfter - quantityBefore,
    reason: input.reason,
    userId: input.userId,
    orderId: input.orderId,
    scheduledDate: input.scheduledDate,
    note: input.note,
  });
}
