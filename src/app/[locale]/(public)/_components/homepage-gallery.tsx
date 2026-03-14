"use client";

import Image from "next/image";

interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
}

export function HomepageGallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

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
              sizes={i === 0 ? "(max-width: 768px) 50vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
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
