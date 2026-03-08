"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

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
    <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
      {categories.map((cat, i) => (
        <motion.div
          key={cat._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <Link href={`/menu?category=${cat._id}`} className="group block text-center">
            <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name.en}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cream-200 text-xs text-brown-400">
                  {cat.name.en.charAt(0)}
                </div>
              )}
            </div>
            <p className="mt-2.5 text-sm font-semibold text-brown-900 transition-colors group-hover:text-terracotta-500">
              {cat.name.en}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
