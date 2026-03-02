"use client";

import { useState } from "react";
import { Card, CardContent, Button, Switch } from "@/components/ui";
import { UtensilsCrossed, Plus, Edit2, Search } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  "All",
  "Arepas",
  "Main Courses",
  "Appetizers",
  "Desserts",
  "Drinks",
] as const;

type Category = (typeof categories)[number];

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, "All">;
  available: boolean;
}

const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Arepa Reina Pepiada",
    description: "Shredded chicken with avocado and mayo",
    price: 8.99,
    category: "Arepas",
    available: true,
  },
  {
    id: 2,
    name: "Arepa Dominó",
    description: "Black beans and queso blanco filling",
    price: 6.99,
    category: "Arepas",
    available: true,
  },
  {
    id: 3,
    name: "Pabellón Criollo",
    description: "Shredded beef with rice, beans, and plantains",
    price: 16.99,
    category: "Main Courses",
    available: true,
  },
  {
    id: 4,
    name: "Grilled Mango Chicken",
    description: "Marinated chicken with fresh mango glaze",
    price: 14.99,
    category: "Main Courses",
    available: false,
  },
  {
    id: 5,
    name: "Tequeños",
    description: "Crispy cheese-filled breadsticks",
    price: 7.99,
    category: "Appetizers",
    available: true,
  },
  {
    id: 6,
    name: "Empanadas de Queso",
    description: "Golden fried corn turnovers with cheese",
    price: 6.99,
    category: "Appetizers",
    available: true,
  },
  {
    id: 7,
    name: "Tres Leches Cake",
    description: "Classic three-milk sponge cake",
    price: 9.99,
    category: "Desserts",
    available: true,
  },
  {
    id: 8,
    name: "Mango Smoothie",
    description: "Fresh mango blended with cream and ice",
    price: 5.99,
    category: "Drinks",
    available: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [availability, setAvailability] = useState<Record<number, boolean>>(
    () =>
      mockMenuItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: item.available }),
        {} as Record<number, boolean>
      )
  );

  const filteredItems =
    activeCategory === "All"
      ? mockMenuItems
      : mockMenuItems.filter((item) => item.category === activeCategory);

  const handleToggleAvailability = (id: number) => {
    setAvailability((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Menu Management</h1>
        <Button>
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-700 hover:bg-cream-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeCategory}
      >
        {filteredItems.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <Card className="overflow-hidden border border-cream-200">
              {/* Image Placeholder */}
              <div className="flex h-40 items-center justify-center bg-cream-200">
                <UtensilsCrossed className="h-10 w-10 text-brown-400" />
              </div>

              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-brown-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-brown-600">
                      {item.description}
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-lg font-bold text-terracotta-500">
                  ${item.price.toFixed(2)}
                </p>

                <div className="flex items-center justify-between">
                  <Switch
                    checked={availability[item.id]}
                    onCheckedChange={() => handleToggleAvailability(item.id)}
                    label={availability[item.id] ? "Available" : "Unavailable"}
                  />
                  <Button variant="ghost" size="icon-sm" aria-label="Edit dish">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
