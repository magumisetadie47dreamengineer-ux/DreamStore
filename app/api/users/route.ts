import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = await db
      .collection("trial")
      .find({})
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

