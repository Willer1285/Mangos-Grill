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
  ModalDescription,
  ModalFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  ImageUpload,
} from "@/components/ui";
import { UtensilsCrossed, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { autoTranslate } from "@/lib/utils/translate";

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
  ingredients?: { en: string[]; es: string[] };
  status: "Available" | "Unavailable";
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  ingredients: "",
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
  const [editingId, setEditingId] = useState<string | null>(null);
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
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, status: newStatus } : p))
    );
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: product.status } : p))
        );
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, status: product.status } : p))
      );
    }
  }

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: Product) {
    setEditingId(item._id);
    setFormData({
      name: item.name.en || item.name.es,
      description: item.description.en || item.description.es,
      price: String(item.price),
      category: item.category?._id || "",
      image: item.image || "",
      ingredients: item.ingredients?.en?.join(", ") || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const [translatedName, translatedDesc] = await autoTranslate([
        formData.name,
        formData.description,
      ]);
      const ingredientArray = formData.ingredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: translatedName,
        description: translatedDesc,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
        ingredients: { en: ingredientArray, es: ingredientArray },
      };
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      fetchData();
    } catch {
      alert("Failed to delete product");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Menu Management</h1>
        <Button onClick={openCreate}>
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
                    <img src={item.image} alt={item.name.es || item.name.en} className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed className="h-10 w-10 text-brown-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-brown-900">{item.name.es || item.name.en}</h3>
                    <p className="text-xs text-brown-500">{item.name.en}</p>
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit dish" onClick={() => openEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Delete dish" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="h-4 w-4 text-error-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Product Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingId ? "Edit Dish" : "Add New Dish"}</ModalTitle>
            <ModalDescription>
              {editingId ? "Update the dish details, pricing, and category." : "Add a new dish to your menu."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <ImageUpload
              label="Dish Photo"
              value={formData.image}
              onChange={(url) => setFormData((p) => ({ ...p, image: url }))}
            />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Dish Name</p>
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Description</p>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Ingredients</p>
              <Input
                label="Ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData((p) => ({ ...p, ingredients: e.target.value }))}
              />
              <p className="text-xs text-brown-400">Separate with commas</p>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Pricing & Category</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price ($)" required type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} />
                <Select value={formData.category || undefined} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                  <SelectTrigger label="Category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                {editingId ? "Save Changes" : "Create Dish"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
