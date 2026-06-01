import { registerUser } from "@/mongo/controllers/users";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    const { status, body } = await registerUser({ name, email, password });
    return NextResponse.json(body, { status });
  } catch (error) {
    console.error("Error in registration:", error);
    const isDbError =
      error.message?.includes("querySrv") ||
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("MongoServerSelectionError");
    return NextResponse.json(
      {
        message: isDbError
          ? "Cannot reach database. Check your internet connection and MongoDB Atlas access."
          : "Internal server error",
      },
      { status: 500 }
    );
  }
}
