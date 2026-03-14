import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import Category from "@/lib/db/models/category";
import Gallery from "@/lib/db/models/gallery";
import Review from "@/lib/db/models/review";
import FAQ from "@/lib/db/models/faq";
import SiteConfig from "@/lib/db/models/site-config";

export async function getHomepageData() {
  await connectDB();

  // Run ALL queries in parallel instead of sequential client-side fetches
  const [categories, bestSellers, galleryItems, reviews, faqs, ratingsAgg] =
    await Promise.all([
      Category.find({ status: "Active" }).sort({ sortOrder: 1 }).lean(),

      Product.find({ featured: true, status: "Available" })
        .populate("category", "name")
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(8)
        .lean(),

      Gallery.find({ active: true })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(5)
        .lean(),

      SiteConfig.findOne()
        .lean()
        .then(async (config) => {
          const limit = config?.homepageReviewsCount || 6;
          return Review.find({ rating: { $gte: 4 } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("product", "name")
            .lean();
        }),

      FAQ.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 }).lean(),

      Review.aggregate([
        { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);

  // Build ratings map
  const ratings: Record<string, { avgRating: number; count: number }> = {};
  for (const item of ratingsAgg) {
    ratings[item._id.toString()] = {
      avgRating: Math.round(item.avgRating * 10) / 10,
      count: item.count,
    };
  }

  // Serialize Mongoose documents to plain objects for client components
  return {
    categories: JSON.parse(JSON.stringify(categories)),
    bestSellers: JSON.parse(JSON.stringify(bestSellers)),
    galleryItems: JSON.parse(JSON.stringify(galleryItems)),
    reviews: JSON.parse(JSON.stringify(reviews)),
    faqs: JSON.parse(JSON.stringify(faqs)),
    ratings: JSON.parse(JSON.stringify(ratings)),
  };
}
