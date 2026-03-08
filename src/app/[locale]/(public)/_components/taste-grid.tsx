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
    <div className="mt-8 flex flex-wrap justify-center gap-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <Link href={`/menu?category=${cat._id}`}>
            <div className="flex w-28 flex-col items-center gap-2 rounded-xl border border-cream-200 bg-white p-4 text-center transition-all hover:border-terracotta-400 hover:shadow-md">
              {cat.image ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <Image src={cat.image} alt={cat.name.en} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-terracotta-500/10 text-terracotta-500">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
                  </svg>
                </div>
              )}
              <span className="text-xs font-semibold text-brown-800">{cat.name.en}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
