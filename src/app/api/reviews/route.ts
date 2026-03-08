import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Review from "@/lib/db/models/review";

// GET /api/reviews?product=<id> — public, returns reviews + avg rating
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const productId = req.nextUrl.searchParams.get("product");
    if (!productId) {
      return NextResponse.json({ error: "product param required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: sanitize(productId) })
      .sort({ createdAt: -1 })
      .lean();

    const count = reviews.length;
    const avgRating =
      count > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
        : 0;

    return NextResponse.json({ reviews, avgRating, count });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews — authenticated users only
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    await connectDB();

    const body = sanitize(await req.json());
    const { product, rating, comment } = body;

    if (!product || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "product and rating (1-5) required" }, { status: 400 });
    }

    const user = session.user as { id: string; firstName?: string; lastName?: string };
    const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

    // Upsert: one review per user per product
    const review = await Review.findOneAndUpdate(
      { product, user: user.id },
      { product, user: user.id, userName, rating, comment: comment || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
