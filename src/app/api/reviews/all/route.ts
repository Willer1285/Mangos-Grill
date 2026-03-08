import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Review from "@/lib/db/models/review";

export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("product", "name")
      .lean();
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([]);
  }
}
