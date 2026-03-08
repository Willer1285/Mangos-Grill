"use client";

import { useState, useEffect } from "react";
import { TasteGrid } from "./taste-grid";
import { FeaturedDishes } from "./featured-dishes";
import { Spinner } from "@/components/ui";

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
  category?: { name: { en: string; es: string } };
  totalSold?: number;
}

export function HomepageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  return <TasteGrid categories={categories} />;
}

export function HomepageBestSellers() {
  const [dishes, setDishes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => setDishes(data.bestSellers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return <FeaturedDishes dishes={dishes} />;
}
