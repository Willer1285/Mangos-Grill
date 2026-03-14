"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LazyMotionProvider } from "@/lib/framer-lazy";

interface Category {
  _id: string;
  name: { en: string; es: string };
  image?: string;
}

interface TasteGridProps {
  categories: Category[];
}

export function TasteGrid({ categories }: TasteGridProps) {
  if (categories.length === 0) return null;

  return (
    <LazyMotionProvider>
      <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-2 sm:gap-8">
        {categories.map((cat, i) => (
          <m.div
            key={cat._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="flex-shrink-0 flex-grow basis-0 min-w-[100px]"
          >
            <Link href={`/menu?category=${cat._id}`} className="group block text-center">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name.en}
                    fill
                    sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cream-200 text-lg text-brown-400">
                    {cat.name.en.charAt(0)}
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-brown-900 transition-colors group-hover:text-terracotta-500 sm:text-base">
                {cat.name.en}
              </p>
            </Link>
          </m.div>
        ))}
      </div>
    </LazyMotionProvider>
  );
}
