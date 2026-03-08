"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button, Card, Badge, Spinner } from "@/components/ui";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";

interface Product {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  slug: string;
  image?: string;
  category?: { name: { en: string; es: string } };
  tags?: string[];
  ingredients?: { en: string[]; es: string[] };
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations("menu");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-brown-500">Product not found.</p>
        <Link href="/menu">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/menu"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-500 hover:text-terracotta-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToMenu")}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-cream-200">
            {product.image ? (
              <Image src={product.image} alt={product.name.en} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-lg text-brown-400">
                {product.name.en}
              </div>
            )}
          </div>
        </Card>

        {/* Details */}
        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-500">
              {product.category.name.en}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-bold text-brown-900">{product.name.en}</h1>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          <p className="mt-4 leading-relaxed text-brown-600">{product.description.en}</p>

          <p className="mt-6 text-3xl font-bold text-terracotta-600">${product.price.toFixed(2)}</p>

          {/* Quantity + Add to Cart */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-cream-300">
              <button
                className="flex h-10 w-10 items-center justify-center text-brown-600 hover:bg-cream-200 disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-brown-900">{qty}</span>
              <button
                className="flex h-10 w-10 items-center justify-center text-brown-600 hover:bg-cream-200"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1 gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t("addToCart")}
            </Button>
          </div>

          {/* Ingredients */}
          {product.ingredients?.en && product.ingredients.en.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-brown-900">Ingredients</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.ingredients.en.map((ing) => (
                  <span key={ing} className="rounded-full bg-cream-200 px-3 py-1 text-xs text-brown-700">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nutritional Info */}
          {product.nutritionalInfo && product.nutritionalInfo.calories > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-brown-900">Nutrition Facts</h3>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: product.nutritionalInfo.calories, unit: "kcal" },
                  { label: "Protein", value: product.nutritionalInfo.protein, unit: "g" },
                  { label: "Carbs", value: product.nutritionalInfo.carbs, unit: "g" },
                  { label: "Fat", value: product.nutritionalInfo.fat, unit: "g" },
                ].map((n) => (
                  <div key={n.label} className="rounded-lg bg-cream-100 p-3 text-center">
                    <p className="text-lg font-bold text-brown-900">{n.value}</p>
                    <p className="text-[10px] uppercase text-brown-500">{n.unit}</p>
                    <p className="mt-1 text-xs text-brown-600">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
