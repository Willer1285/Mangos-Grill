import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import Category from "@/lib/db/models/category";

export async function GET() {
  try {
    await connectDB();

    // Get active categories
    const categories = await Category.find({ status: "Active" })
      .sort({ sortOrder: 1 })
      .lean();

    // Get featured products (marked as "Show on Homepage" in admin)
    const featuredProducts = await Product.find({
      featured: true,
      status: "Available",
    })
      .populate("category", "name")
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(8)
      .lean();

    return NextResponse.json({ categories, bestSellers: featuredProducts });
  } catch (error) {
    console.error("Homepage data error:", error);
    return NextResponse.json({ categories: [], bestSellers: [] });
  }
}
