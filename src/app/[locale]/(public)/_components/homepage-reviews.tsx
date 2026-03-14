"use client";

import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { ChevronRight } from "lucide-react";

interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  product?: { name: { en: string; es: string } };
  createdAt: string;
}

export function HomepageReviews({ reviews }: { reviews: ReviewItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Infinite scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length < 2) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    function step() {
      if (!paused && el) {
        pos += speed;
        if (pos >= el.scrollWidth / 2) {
          pos = 0;
        }
        el.scrollLeft = pos;
      }
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [reviews, paused]);

  if (reviews.length === 0) return null;

  const displayReviews = reviews.length >= 2 ? [...reviews, ...reviews] : reviews;

  return (
    <div>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {displayReviews.map((review, i) => (
          <div
            key={`${review._id}-${i}`}
            className="w-80 flex-shrink-0 rounded-xl border border-cream-200 bg-white p-6 shadow-sm"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= review.rating ? "fill-gold-400 text-gold-400" : "text-cream-300"}`}
                />
              ))}
            </div>
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-brown-700">
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
      <div className="mt-8 text-center">
        <Link href="/reviews">
          <Button variant="secondary" size="sm" className="gap-1">
            View All Reviews <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
