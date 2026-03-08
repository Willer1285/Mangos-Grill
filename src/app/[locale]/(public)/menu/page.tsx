"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button, Card, Spinner } from "@/components/ui";
import { Plus, UtensilsCrossed } from "lucide-react";

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
  image?: string;
  category: Category | string;
  status: string;
}

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
                      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                        <div className="relative aspect-[4/3] bg-cream-200">
                          {item.image ? (
                            <Image src={item.image} alt={item.name.en} fill className="object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-brown-400">
                              {item.name.en}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          {catName && (
                            <span className="text-xs font-medium text-terracotta-500">
                              {catName}
                            </span>
                          )}
                          <h3 className="mt-1 text-sm font-semibold text-brown-900">{item.name.en}</h3>
                          <p className="mt-0.5 text-xs text-brown-600 line-clamp-2">{item.description.en}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-base font-bold text-terracotta-600">
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
