"use client";

import { useState } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  productCount: number;
}

const mockCategories: Category[] = [
  { id: 1, name: "Arepas", productCount: 8 },
  { id: 2, name: "Main Courses", productCount: 12 },
  { id: 3, name: "Appetizers", productCount: 6 },
  { id: 4, name: "Desserts", productCount: 5 },
  { id: 5, name: "Drinks", productCount: 10 },
  { id: 6, name: "Specials", productCount: 3 },
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

export default function CategoriesPage() {
  const [categoriesList] = useState<Category[]>(mockCategories);

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Categories</h1>
        <Button>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categoriesList.map((category) => (
          <motion.div key={category.id} variants={itemVariants}>
            <Card className="overflow-hidden border border-cream-200">
              {/* Image Placeholder */}
              <div className="flex h-32 items-center justify-center bg-cream-200">
                <FolderOpen className="h-10 w-10 text-brown-400" />
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brown-900">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-brown-600">
                      {category.productCount} products
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="icon"
                      size="icon-sm"
                      aria-label="Edit category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="icon"
                      size="icon-sm"
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4 text-error-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
