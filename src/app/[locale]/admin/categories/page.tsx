"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ImageUpload,
} from "@/components/ui";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { autoTranslate } from "@/lib/utils/translate";

interface Category {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  image?: string;
  status: "Active" | "Inactive";
  sortOrder: number;
}

const EMPTY_FORM = { name: "", description: "", image: "" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat._id);
    setFormData({
      name: cat.name.en || cat.name.es,
      description: cat.description.en || cat.description.es,
      image: cat.image || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const [name, description] = await autoTranslate([
        formData.name,
        formData.description,
      ]);
      const payload = {
        name,
        description,
        image: formData.image,
      };
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save category");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      fetchCategories();
    } catch {
      alert("Failed to delete category");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center text-brown-500">No categories yet. Create your first one.</div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <motion.div key={category._id} variants={itemVariants}>
              <Card className="overflow-hidden border border-cream-200">
                <div className="flex h-32 items-center justify-center bg-cream-200">
                  {category.image ? (
                    <img src={category.image} alt={category.name.es || category.name.en} className="h-full w-full object-cover" />
                  ) : (
                    <FolderOpen className="h-10 w-10 text-brown-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-brown-900">{category.name.es || category.name.en}</h3>
                      <p className="text-sm text-brown-500">{category.name.en}</p>
                      {(category.description.es || category.description.en) && (
                        <p className="mt-1 text-sm text-brown-600">{category.description.es || category.description.en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="icon" size="icon-sm" aria-label="Edit category" onClick={() => openEdit(category)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="icon" size="icon-sm" aria-label="Delete category" onClick={() => handleDelete(category._id)}>
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

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingId ? "Edit Category" : "Add New Category"}</ModalTitle>
            <ModalDescription>
              {editingId
                ? "Update the category details below."
                : "Add a new menu category. Translations are generated automatically."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <ImageUpload
              label="Category Image"
              value={formData.image}
              onChange={(url) => setFormData((p) => ({ ...p, image: url }))}
            />

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Category Name</p>
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Appetizers"
              />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Description</p>
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>
                {editingId ? "Save Changes" : "Create Category"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
