"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button, Card, Badge, Spinner } from "@/components/ui";
import { ArrowLeft, Plus, Minus, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useBrand, formatPrice, formatDate } from "@/lib/brand/brand-context";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  slug: string;
  image?: string;
  category?: { _id: string; name: { en: string; es: string } };
  tags?: string[];
  ingredients?: { en: string[]; es: string[] };
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  avgRating: number;
  count: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations("menu");
  const { addItem } = useCart();
  const { currency, timezone } = useBrand();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Reviews
  const [reviewsData, setReviewsData] = useState<ReviewsData>({ reviews: [], avgRating: 0, count: 0 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  // Similar products
  const [similar, setSimilar] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Fetch reviews
          fetchReviews(data._id);
          // Fetch similar products from same category
          if (data.category?._id) {
            fetchSimilar(data.category._id, data._id);
          }
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchProduct();
  }, [params.slug]);

  async function fetchReviews(productId: string) {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`);
      if (res.ok) {
        setReviewsData(await res.json());
      }
    } catch { /* empty */ }
  }

  async function fetchSimilar(categoryId: string, excludeId: string) {
    try {
      const res = await fetch(`/api/products?category=${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (Array.isArray(data) ? data : [])
          .filter((p: Product) => p._id !== excludeId)
          .slice(0, 4);
        setSimilar(filtered);
      }
    } catch { /* empty */ }
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name.en,
      image: product.image,
      price: product.price,
      quantity: qty,
      modifiers: [],
      extras: [],
    });
    toast.success(`${product.name.en} added to cart`);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.status === 401) {
        toast.error("Please log in to leave a review");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
        return;
      }
      toast.success("Review submitted!");
      setReviewComment("");
      fetchReviews(product._id);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

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

          {/* Rating summary */}
          {reviewsData.count > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(reviewsData.avgRating) ? "fill-gold-400 text-gold-400" : "text-cream-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-brown-700">{reviewsData.avgRating}</span>
              <span className="text-sm text-brown-500">({reviewsData.count} reviews)</span>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          <p className="mt-6 text-3xl font-bold text-terracotta-600">{formatPrice(product.price, currency)}</p>

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
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
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

          {/* Description (below ingredients) */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-brown-900">About this dish</h3>
            <p className="mt-2 leading-relaxed text-brown-600">{product.description.en}</p>
          </div>

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

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-brown-900">Reviews</h2>

        {/* Review Form */}
        <Card className="mt-6 p-6">
          <h3 className="text-sm font-semibold text-brown-900">Leave a review</h3>
          <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        s <= (hoverStar || reviewRating)
                          ? "fill-gold-400 text-gold-400"
                          : "text-cream-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-brown-900 placeholder:text-brown-400 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                placeholder="Share your experience..."
              />
            </div>
            <Button type="submit" loading={submittingReview}>
              Submit Review
            </Button>
          </form>
        </Card>

        {/* Reviews List */}
        {reviewsData.reviews.length > 0 ? (
          <div className="mt-6 space-y-4">
            {reviewsData.reviews.map((review) => (
              <Card key={review._id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brown-900">{review.userName}</p>
                    <div className="mt-1 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-gold-400 text-gold-400" : "text-cream-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-brown-500">
                    {formatDate(review.createdAt, timezone)}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-brown-600">{review.comment}</p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-brown-500">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-brown-900">You might also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <Card key={item._id} className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] bg-cream-200">
                  {item.image ? (
                    <Image src={item.image} alt={item.name.en} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-brown-400">
                      {item.name.en}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-1 text-sm font-semibold text-brown-900">{item.name.en}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-brown-600">{item.description.en}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-base font-bold text-terracotta-600">
                      {formatPrice(item.price, currency)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/menu/${item.slug || item._id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cream-200 text-brown-600 transition-colors hover:bg-cream-300 hover:text-brown-900"
                        aria-label="View details"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          addItem({
                            productId: item._id,
                            name: item.name.en,
                            image: item.image,
                            price: item.price,
                            quantity: 1,
                            modifiers: [],
                            extras: [],
                          });
                          toast.success(`${item.name.en} added to cart`);
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
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
