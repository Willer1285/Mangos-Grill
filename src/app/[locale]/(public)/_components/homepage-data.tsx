"use client";

import { TasteGrid } from "./taste-grid";
import { FeaturedDishes } from "./featured-dishes";

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
  category?: { name: { en: string; es: string } };
  tags?: string[];
}

export function HomepageCategories({ categories }: { categories: Category[] }) {
  return <TasteGrid categories={categories} />;
}

export function HomepageBestSellers({
  dishes,
  ratings,
}: {
  dishes: Product[];
  ratings?: Record<string, { avgRating: number; count: number }>;
}) {
  return <FeaturedDishes dishes={dishes} ratings={ratings} />;
}
