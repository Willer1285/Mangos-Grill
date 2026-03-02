"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";
import { Plus, UtensilsCrossed, Beef, Salad, Coffee, IceCreamCone, Sandwich } from "lucide-react";

const categories = [
  { id: "all", labelKey: "allItems", icon: UtensilsCrossed },
  { id: "arepas", labelKey: "categories.arepas", icon: Sandwich },
  { id: "main", labelKey: "categories.mainCourses", icon: Beef },
  { id: "appetizers", labelKey: "categories.appetizers", icon: Salad },
  { id: "sides", labelKey: "categories.sides", icon: Salad },
  { id: "drinks", labelKey: "categories.drinks", icon: Coffee },
  { id: "desserts", labelKey: "categories.desserts", icon: IceCreamCone },
];

const menuItems = [
  { id: "1", name: "Arepa Reina Pepiada", desc: "Shredded chicken salad in crispy corn arepa", price: 12.99, category: "arepas", catLabel: "Arepas" },
  { id: "2", name: "Pabellon Criollo", desc: "Shredded beef, rice, black beans & plantains", price: 16.95, category: "main", catLabel: "Main Courses" },
  { id: "3", name: "Cachapas con Queso", desc: "Sweet corn cakes with melted hand cheese", price: 13.99, category: "main", catLabel: "Main Courses" },
  { id: "4", name: "Empanadas (3 pcs)", desc: "Crispy corn turnovers with your choice of filling", price: 10.99, category: "appetizers", catLabel: "Appetizers" },
  { id: "5", name: "Tequenos (6 pcs)", desc: "Cheese-filled pastry sticks with guasacaca dip", price: 9.99, category: "appetizers", catLabel: "Appetizers" },
  { id: "6", name: "Arepa Domino", desc: "Black beans and white cheese in crispy white arepa", price: 11.99, category: "arepas", catLabel: "Arepas" },
  { id: "7", name: "Patacon Maracucho", desc: "Fried plantain sandwich with beef and toppings", price: 14.99, category: "main", catLabel: "Main Courses" },
  { id: "8", name: "Chicha Venezolana", desc: "Traditional rice drink with cinnamon and condensed milk", price: 5.99, category: "drinks", catLabel: "Drinks" },
  { id: "9", name: "Tres Leches Cake", desc: "Three-milk sponge cake with whipped cream", price: 8.99, category: "desserts", catLabel: "Desserts" },
];

export default function MenuPage() {
  const t = useTranslations("menu");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Header */}
      <section className="bg-brown-900 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          {t("exploreTitle")}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 text-cream-400">{t("subtitle")}</p>
      </section>

      {/* Menu content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Categories sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <Card className="p-4">
              <h2 className="mb-3 text-sm font-semibold text-brown-900">Categories</h2>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "bg-terracotta-500 text-white"
                          : "text-brown-700 hover:bg-cream-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(cat.labelKey)}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="aspect-[4/3] bg-cream-300">
                      <div className="flex h-full items-center justify-center text-sm text-brown-500">
                        {item.name}
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-terracotta-500">
                        {item.catLabel}
                      </span>
                      <h3 className="mt-1 text-sm font-semibold text-brown-900">{item.name}</h3>
                      <p className="mt-0.5 text-xs text-brown-600 line-clamp-2">{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-semibold text-terracotta-600">
                          ${item.price.toFixed(2)}
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
          </div>
        </div>
      </section>
    </>
  );
}
