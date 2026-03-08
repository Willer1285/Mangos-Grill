"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Spinner } from "@/components/ui";

interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  product?: { name: { en: string; es: string } };
  createdAt: string;
}

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews/all")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          Our Guests
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-4xl font-semibold text-white">
          Customer Reviews
        </h1>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-brown-500">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-xl border border-cream-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? "fill-gold-400 text-gold-400" : "text-cream-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-brown-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brown-700">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-brown-900">— {review.userName}</p>
                  {review.product && (
                    <p className="mt-0.5 text-xs text-brown-500">{review.product.name.en}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
