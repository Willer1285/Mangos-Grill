"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { Plus } from "lucide-react";

const featuredDishes = [
  {
    id: "1",
    name: "Arepa Reina Pepiada",
    description: "Shredded chicken salad in crispy corn arepa",
    price: 12.99,
    category: "Arepas",
  },
  {
    id: "2",
    name: "Pabellon Criollo",
    description: "Shredded beef, rice, black beans & plantains",
    price: 16.95,
    category: "Main Courses",
  },
  {
    id: "3",
    name: "Cachapas con Queso",
    description: "Sweet corn cakes with melted hand cheese",
    price: 13.99,
    category: "Main Courses",
  },
  {
    id: "4",
    name: "Empanadas (3 pcs)",
    description: "Crispy corn turnovers with your choice of filling",
    price: 10.99,
    category: "Appetizers",
  },
];

export function FeaturedDishes() {
  const t = useTranslations("menu");

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {featuredDishes.map((dish, i) => (
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-cream-300">
              <div className="flex h-full items-center justify-center text-sm text-brown-500">
                {dish.name}
              </div>
            </div>

            <div className="p-4">
              <span className="text-xs font-medium text-terracotta-500">{dish.category}</span>
              <h3 className="mt-1 text-sm font-semibold text-brown-900">{dish.name}</h3>
              <p className="mt-0.5 text-xs text-brown-600 line-clamp-2">{dish.description}</p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-semibold text-terracotta-600">
                  ${dish.price.toFixed(2)}
                </span>
                <Button variant="cta" size="sm" className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  {t("addToCart")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
