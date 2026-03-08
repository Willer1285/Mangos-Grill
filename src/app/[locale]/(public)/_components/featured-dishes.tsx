"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui";
import { Flame } from "lucide-react";

interface FeaturedProduct {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  image?: string;
  category?: { name: { en: string; es: string } };
  totalSold?: number;
}

interface FeaturedDishesProps {
  dishes: FeaturedProduct[];
}

export function FeaturedDishes({ dishes }: FeaturedDishesProps) {
  if (dishes.length === 0) return null;

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {dishes.slice(0, 4).map((dish, i) => (
        <motion.div
          key={dish._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative aspect-[4/3] bg-cream-200">
              {dish.image ? (
                <Image src={dish.image} alt={dish.name.en} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-brown-400">
                  {dish.name.en}
                </div>
              )}
              {(dish.totalSold ?? 0) > 0 && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-terracotta-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-md">
                  <Flame className="h-3 w-3" />
                  Best Seller
                </div>
              )}
            </div>
            <div className="p-4">
              {dish.category && (
                <span className="text-xs font-medium text-terracotta-500">
                  {dish.category.name.en}
                </span>
              )}
              <h3 className="mt-1 text-sm font-semibold text-brown-900">{dish.name.en}</h3>
              <p className="mt-0.5 text-xs text-brown-600 line-clamp-2">{dish.description.en}</p>
              <div className="mt-3">
                <span className="text-base font-bold text-terracotta-600">
                  ${dish.price.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
