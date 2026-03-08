"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, Spinner, Badge } from "@/components/ui";
import { Plus, ArrowRight, UtensilsCrossed } from "lucide-react";
import type { BadgeVariant } from "@/components/ui/badge";

interface Category {
  _id: string;
  name: { en: string; es: string };
  image?: string;
}

interface Product {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  slug?: string;
  image?: string;
  category: Category | string;
  status: string;
  tags?: string[];
}

const TAG_VARIANT_MAP: Record<string, BadgeVariant> = {
  Popular: "popular",
  Spicy: "spicy",
  Vegan: "vegan",
  New: "new-tag",
  "Gluten-Free": "olive",
  "Chef's Choice": "primary",
};

export default function MenuPage() {
  const t = useTranslations("menu");
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData.filter((c: Category & { status?: string }) => c.status === "Active") : []);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(Array.isArray(prodData) ? prodData : []);
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((item) => {
          const catId = typeof item.category === "object" ? item.category._id : item.category;
          return catId === activeCategory;
        });

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          {t("exploreTitle")}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">{t("title")}</h1>
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
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeCategory === "all"
                      ? "bg-terracotta-500 text-white"
                      : "text-brown-700 hover:bg-cream-200"
                  }`}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  {t("allItems")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeCategory === cat._id
                        ? "bg-terracotta-500 text-white"
                        : "text-brown-700 hover:bg-cream-200"
                    }`}
                  >
                    {cat.image ? (
                      <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded">
                        <Image src={cat.image} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <UtensilsCrossed className="h-4 w-4" />
                    )}
                    {cat.name.en}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-brown-500">
                No products available in this category.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item, i) => {
                  const catName = typeof item.category === "object" ? item.category.name.en : "";
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                        <div className="relative aspect-[4/3] bg-cream-200">
                          {item.image ? (
                            <Image src={item.image} alt={item.name.en} fill className="object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-brown-400">
                              {item.name.en}
                            </div>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
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
                          {catName && (
                            <span className="text-xs font-medium text-terracotta-500">
                              {catName}
                            </span>
                          )}
                          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-brown-900">
                            {item.name.en}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-xs text-brown-600">
                            {item.description.en}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <span className="text-base font-bold text-terracotta-600">
                              ${item.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/menu/${item.slug || item._id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brown-500 transition-colors hover:bg-cream-200 hover:text-brown-900"
                                aria-label="View details"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <button
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
            )}
          </div>
        </div>
      </section>
    </>
  );
}
