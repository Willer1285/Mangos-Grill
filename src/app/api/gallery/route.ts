import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Gallery from "@/lib/db/models/gallery";

export async function GET() {
  try {
    await connectDB();
    const items = await Gallery.find({ active: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
