import { NextResponse } from "next/server";

/** Lightweight health check (no database). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "dreamstore",
    timestamp: Date.now(),
  });
}
