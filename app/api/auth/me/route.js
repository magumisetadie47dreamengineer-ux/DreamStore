import { getUserFromRequest } from "@/lib/auth/apiAuth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
