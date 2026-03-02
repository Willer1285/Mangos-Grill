"use client";

import { motion } from "framer-motion";

const dishes = [
  { name: "Arepa Reina Pepiada", image: "/placeholder.jpg" },
  { name: "Pabellon Criollo", image: "/placeholder.jpg" },
  { name: "Cachapas con Queso", image: "/placeholder.jpg" },
  { name: "Empanadas", image: "/placeholder.jpg" },
  { name: "Tequenos", image: "/placeholder.jpg" },
  { name: "Hallacas", image: "/placeholder.jpg" },
];

export function TasteGrid() {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {dishes.map((dish, i) => (
        <motion.div
          key={dish.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-cream-300"
        >
          <div className="flex h-full items-center justify-center text-sm text-brown-500">
            {dish.name}
          </div>
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brown-900/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <p className="p-4 text-sm font-semibold text-white">{dish.name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
