import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import Category from "@/lib/db/models/category";
import Order from "@/lib/db/models/order";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    // Get active categories
    const categories = await Category.find({ status: "Active" })
      .sort({ sortOrder: 1 })
      .lean();

    // Get best-selling product IDs from orders
    const bestSellerAgg = await Order.aggregate([
      { $match: { status: { $nin: ["Cancelled"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 8 },
    ]);

    const bestSellerIds = bestSellerAgg.map((b) => b._id);
    const soldMap = new Map<string, number>(
      bestSellerAgg.map((b) => [String(b._id), b.totalSold])
    );

    // Get the best-selling products with details
    const bestSellerProducts = await Product.find({
      _id: { $in: bestSellerIds.map((id: string) => new mongoose.Types.ObjectId(String(id))) },
      status: "Available",
    })
      .populate("category", "name")
      .lean();

    // Add totalSold and sort
    let bestSellers = bestSellerProducts
      .map((p) => ({
        ...p,
        totalSold: soldMap.get(String(p._id)) || 0,
      }))
      .sort((a, b) => b.totalSold - a.totalSold);

    // If we don't have enough, fill with featured/recent available products
    if (bestSellers.length < 4) {
      const existingIds = bestSellers.map((p) => String(p._id));
      const additional = await Product.find({
        _id: { $nin: existingIds.map((id) => new mongoose.Types.ObjectId(id)) },
        status: "Available",
      })
        .populate("category", "name")
        .sort({ featured: -1, createdAt: -1 })
        .limit(8 - bestSellers.length)
        .lean();
      bestSellers = [
        ...bestSellers,
        ...additional.map((p) => ({ ...p, totalSold: 0 })),
      ];
    }

    return NextResponse.json({ categories, bestSellers });
  } catch (error) {
    console.error("Homepage data error:", error);
    return NextResponse.json({ categories: [], bestSellers: [] });
  }
}
