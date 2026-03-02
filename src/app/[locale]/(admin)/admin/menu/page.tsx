"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Switch,
  Spinner,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui";
import { UtensilsCrossed, Plus, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  _id: string;
  name: { en: string; es: string };
}

interface Product {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  price: number;
  category: Category;
  image?: string;
  status: "Available" | "Unavailable";
}

const EMPTY_FORM = {
  nameEn: "",
  nameEs: "",
  descEn: "",
  descEs: "",
  price: "",
  category: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);

      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products?${params}`),
        fetch("/api/admin/categories"),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleToggle(product: Product) {
    const newStatus = product.status === "Available" ? "Unavailable" : "Available";
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
    );
    // Optimistic update — no PATCH endpoint exists yet, but UI reflects instantly
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: { en: formData.nameEn, es: formData.nameEs },
          description: { en: formData.descEn, es: formData.descEs },
          price: parseFloat(formData.price),
          category: formData.category,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create product");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Menu Management</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Dish
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("All")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === "All"
              ? "bg-terracotta-500 text-white"
              : "border border-cream-200 bg-white text-brown-700 hover:bg-cream-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat._id
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-700 hover:bg-cream-200"
            }`}
          >
            {cat.name.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-brown-500">No menu items yet. Add your first dish.</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeCategory}
        >
          {products.map((item) => (
            <motion.div key={item._id} variants={itemVariants}>
              <Card className="overflow-hidden border border-cream-200">
                <div className="flex h-40 items-center justify-center bg-cream-200">
                  {item.image ? (
                    <img src={item.image} alt={item.name.en} className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="h-10 w-10 text-brown-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-brown-900">{item.name.en}</h3>
                    <p className="mt-1 text-sm text-brown-600">{item.description.en}</p>
                  </div>
                  <p className="mb-4 text-lg font-bold text-terracotta-500">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={item.status === "Available"}
                      onCheckedChange={() => handleToggle(item)}
                      label={item.status === "Available" ? "Available" : "Unavailable"}
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
      )}

      {/* Create Product Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Dish</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-error-500">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Name (English)</label>
                <Input required value={formData.nameEn} onChange={(e) => setFormData((p) => ({ ...p, nameEn: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Name (Spanish)</label>
                <Input required value={formData.nameEs} onChange={(e) => setFormData((p) => ({ ...p, nameEs: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Description (English)</label>
              <Textarea value={formData.descEn} onChange={(e) => setFormData((p) => ({ ...p, descEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Description (Spanish)</label>
              <Textarea value={formData.descEs} onChange={(e) => setFormData((p) => ({ ...p, descEs: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Price ($)</label>
                <Input required type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="h-10 w-full rounded-md border border-cream-300 bg-white px-3 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name.en}</option>
                  ))}
                </select>
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Dish"}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
