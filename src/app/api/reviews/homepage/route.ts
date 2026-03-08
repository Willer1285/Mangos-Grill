import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Review from "@/lib/db/models/review";
import SiteConfig from "@/lib/db/models/site-config";

export async function GET() {
  try {
    await connectDB();

    const config = await SiteConfig.findOne().lean();
    const limit = config?.homepageReviewsCount || 6;

    const reviews = await Review.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("product", "name")
      .lean();

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([]);
  }
}
