import { NextResponse } from "next/server";

/**
 * SSE removed — long-lived streams on Vercel Hobby exhaust function + DB slots
 * when multiple devices/tabs are open. Clients poll GET /api/inventory instead.
 */
export async function GET() {
  return NextResponse.json(
    { message: "Realtime stream disabled. Use GET /api/inventory." },
    { status: 410 }
  );
}
