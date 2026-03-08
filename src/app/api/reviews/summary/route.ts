import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Review from "@/lib/db/models/review";

// GET /api/reviews/summary — returns avg rating + count for all products
export async function GET() {
  try {
    await connectDB();

    const pipeline = await Review.aggregate([
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const ratings: Record<string, { avgRating: number; count: number }> = {};
    for (const item of pipeline) {
      ratings[item._id.toString()] = {
        avgRating: Math.round(item.avgRating * 10) / 10,
        count: item.count,
      };
    }

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Reviews summary error:", error);
    return NextResponse.json({});
  }
}
