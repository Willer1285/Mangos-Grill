import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Category from "@/lib/db/models/category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({ sortOrder: 1 }).lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
