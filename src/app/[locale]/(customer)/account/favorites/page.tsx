"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Button } from "@/components/ui";
import { Heart, ShoppingBag } from "lucide-react";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";

/* Mock data — will be fetched from API in production */
const mockFavorites = [
  {
    id: 1,
    name: "Arepa Reina Pepiada",
    description: "Shredded chicken with avocado and mayo in a crispy arepa",
    price: 12.99,
  },
  {
    id: 2,
    name: "Pabellon Criollo",
    description: "Shredded beef, black beans, rice, and fried plantains",
    price: 16.99,
  },
  {
    id: 3,
    name: "Teque\u00f1os (6pc)",
    description: "Crispy cheese sticks wrapped in dough, served with guasacaca",
    price: 9.99,
  },
  {
    id: 4,
    name: "Cachapa con Queso",
    description: "Sweet corn pancake filled with hand-pulled queso de mano",
    price: 13.99,
  },
  {
    id: 5,
    name: "Asado Negro",
    description: "Slow-braised beef in papel\u00f3n sauce with creamy mashed potatoes",
    price: 19.99,
  },
  {
    id: 6,
    name: "Tres Leches",
    description: "Classic three-milk sponge cake with whipped cream topping",
    price: 8.99,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FavoritesPage() {
  const t = useTranslations("customer");
  const { currency } = useBrand();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">{t("favorites")}</h1>
        <p className="mt-1 text-sm text-brown-600">
          {mockFavorites.length} {t("dishSaved")}
        </p>
      </div>

      {/* Favorites Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {mockFavorites.map((dish) => (
          <motion.div key={dish.id} variants={item}>
            <Card className="group relative border border-cream-200 transition-shadow hover:shadow-md">
              <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="flex h-40 items-center justify-center bg-cream-200">
                  <ShoppingBag className="h-10 w-10 text-cream-400" />
                </div>

                {/* Heart icon */}
                <button
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition-colors hover:bg-white"
                  aria-label="Remove from favorites"
                >
                  <Heart className="h-4 w-4 fill-error-500 text-error-500" />
                </button>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-brown-900">{dish.name}</h3>
                  <p className="mt-1 text-xs text-brown-500 line-clamp-2">
                    {dish.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-terracotta-500">
                      {formatPrice(dish.price, currency)}
                    </span>
                    <Button variant="secondary" size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
