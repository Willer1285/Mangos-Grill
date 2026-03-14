"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/badge";
import { Plus, ArrowRight, Star, Heart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useFavorites } from "@/lib/favorites/favorites-context";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface FeaturedProduct {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  slug?: string;
  image?: string;
  category?: { name: { en: string; es: string } };
  tags?: string[];
}

interface FeaturedDishesProps {
  dishes: FeaturedProduct[];
}

const TAG_VARIANT_MAP: Record<string, BadgeVariant> = {
  Popular: "popular",
  Spicy: "spicy",
  Vegan: "vegan",
  New: "new-tag",
  "Gluten-Free": "olive",
  "Chef's Choice": "primary",
};

type RatingsMap = Record<string, { avgRating: number; count: number }>;

export function FeaturedDishes({ dishes }: FeaturedDishesProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const tf = useTranslations("customer");
  const { currency } = useBrand();
  const [ratings, setRatings] = useState<RatingsMap>({});

  useEffect(() => {
    fetch("/api/reviews/summary")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setRatings(data))
      .catch(() => {});
  }, []);

  if (dishes.length === 0) return null;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {dishes.slice(0, 4).map((dish, i) => {
        const r = ratings[dish._id];
        return (
          <motion.div
            key={dish._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-cream-200">
                {dish.image ? (
                  <Image src={dish.image} alt={dish.name.en} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-brown-400">
                    {dish.name.en}
                  </div>
                )}
                {dish.tags && dish.tags.length > 0 && (
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {dish.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant={TAG_VARIANT_MAP[tag] || "default"}
                        className="text-[10px] shadow-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                {dish.category && (
                  <span className="text-xs font-medium text-terracotta-500">
                    {dish.category.name.en}
                  </span>
                )}
                <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-brown-900">{dish.name.en}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-brown-600">{dish.description.en}</p>
                {/* Star rating */}
                {r && r.count > 0 && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= Math.round(r.avgRating) ? "fill-gold-400 text-gold-400" : "text-cream-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-brown-500">({r.count})</span>
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-base font-bold text-terracotta-600">
                    {formatPrice(dish.price, currency)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/menu/${dish.slug || dish._id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cream-200 text-brown-600 transition-colors hover:bg-cream-300 hover:text-brown-900"
                      aria-label="View details"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={async () => {
                        const action = await toggleFavorite(dish._id);
                        if (action === "added") toast.success(tf("addedToFavorites"));
                        else if (action === "removed") toast.success(tf("removedFromFavorites"));
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cream-200 text-brown-600 transition-colors hover:bg-cream-300 hover:text-brown-900"
                      aria-label={isFavorite(dish._id) ? tf("removeFromFavorites") : tf("addToFavorites")}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(dish._id) ? "fill-terracotta-500 text-terracotta-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => {
                        addItem({
                          productId: dish._id,
                          name: dish.name.en,
                          image: dish.image,
                          price: dish.price,
                          quantity: 1,
                          modifiers: [],
                          extras: [],
                        });
                        toast.success(`${dish.name.en} added to cart`);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brown-900 text-white transition-colors hover:bg-brown-800"
                      aria-label="Add to cart"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
