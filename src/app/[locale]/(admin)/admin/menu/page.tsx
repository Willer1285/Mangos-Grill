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
  Badge,
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
import { UtensilsCrossed, Plus, Edit2, Trash2, MapPin, Package } from "lucide-react";
import { motion } from "framer-motion";
import { autoTranslate } from "@/lib/utils/translate";

interface Category {
  _id: string;
  name: { en: string; es: string };
}

interface Location {
  _id: string;
  name: string;
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
  locations: string[];
  hasStock: boolean;
  stock: number;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  ingredients: "",
  locations: [] as string[],
  allLocations: true,
  hasStock: false,
  stock: "",
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
  const [locations, setLocations] = useState<Location[]>([]);
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

      const [prodRes, catRes, locRes] = await Promise.all([
        fetch(`/api/admin/products?${params}`),
        fetch("/api/admin/categories"),
        fetch("/api/admin/locations"),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (locRes.ok) setLocations(await locRes.json());
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
    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
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
    const itemLocations = item.locations || [];
    const isAllLocations = itemLocations.length === 0;
    setEditingId(item._id);
    setFormData({
      name: item.name.en || item.name.es,
      description: item.description.en || item.description.es,
      price: String(item.price),
      category: item.category?._id || "",
      image: item.image || "",
      ingredients: item.ingredients?.en?.join(", ") || "",
      locations: itemLocations,
      allLocations: isAllLocations,
      hasStock: item.hasStock || false,
      stock: item.hasStock ? String(item.stock) : "",
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
        locations: formData.allLocations ? [] : formData.locations,
        hasStock: formData.hasStock,
        stock: formData.hasStock ? parseInt(formData.stock) || 0 : 0,
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

  function toggleLocation(locName: string) {
    setFormData((prev) => {
      const has = prev.locations.includes(locName);
      return {
        ...prev,
        locations: has
          ? prev.locations.filter((l) => l !== locName)
          : [...prev.locations, locName],
      };
    });
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
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {item.locations && item.locations.length > 0 ? (
                      item.locations.map((loc) => (
                        <Badge key={loc} variant="default" className="text-[10px]">
                          <MapPin className="mr-0.5 h-2.5 w-2.5" />
                          {loc}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="default" className="text-[10px]">All Locations</Badge>
                    )}
                    {item.hasStock && (
                      <Badge variant={item.stock > 0 ? "active" : "disabled"} className="text-[10px]">
                        <Package className="mr-0.5 h-2.5 w-2.5" />
                        {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                      </Badge>
                    )}
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

            <div className="border-t border-cream-200" />

            {/* Locations */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Availability by Location</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allLocations}
                  onChange={(e) => setFormData((p) => ({ ...p, allLocations: e.target.checked, locations: [] }))}
                  className="h-4 w-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-500"
                />
                <span className="text-sm text-brown-700">Available at all locations</span>
              </label>
              {!formData.allLocations && locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc._id}
                      type="button"
                      onClick={() => toggleLocation(loc.name)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        formData.locations.includes(loc.name)
                          ? "border-terracotta-500 bg-terracotta-500 text-white"
                          : "border-cream-300 bg-white text-brown-700 hover:border-terracotta-300"
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-cream-200" />

            {/* Stock */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Stock Management</p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasStock}
                  onChange={(e) => setFormData((p) => ({ ...p, hasStock: e.target.checked, stock: "" }))}
                  className="h-4 w-4 rounded border-cream-300 text-terracotta-500 focus:ring-terracotta-500"
                />
                <span className="text-sm text-brown-700">Track stock for this item</span>
              </label>
              {formData.hasStock && (
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))}
                />
              )}
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
