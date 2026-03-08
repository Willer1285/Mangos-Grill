import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import FAQ from "@/lib/db/models/faq";

export async function GET() {
  try {
    await connectDB();
    const items = await FAQ.find({ active: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
