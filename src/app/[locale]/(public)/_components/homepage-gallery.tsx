"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui";

interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
}

export function HomepageGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) return null;

  // Build a masonry-style grid: first image spans 2 cols/rows on md+
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.slice(0, 5).map((item, i) => (
        <div
          key={item._id}
          className={`group relative overflow-hidden rounded-xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
        >
          <div className="relative aspect-square h-full w-full">
            <Image
              src={item.image}
              alt={item.caption || "Gallery"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {item.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-xs text-white">{item.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
