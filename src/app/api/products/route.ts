import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = { status: "Available" };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { "name.en": { $regex: search, $options: "i" } },
        { "name.es": { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
        { "description.es": { $regex: search, $options: "i" } },
      ];
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const location = searchParams.get("location");
    if (location) {
      filter.$and = [
        ...(filter.$and ? (filter.$and as unknown[]) : []),
        { $or: [{ locations: { $size: 0 } }, { locations: location }] },
      ];
    }

    const products = await Product.find(filter)
      .populate("category")
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
