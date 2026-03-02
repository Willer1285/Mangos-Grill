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
  ModalFooter,
} from "@/components/ui";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
  _id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  image?: string;
  status: "Active" | "Inactive";
  sortOrder: number;
}

const EMPTY_FORM = { nameEn: "", nameEs: "", descEn: "", descEs: "" };

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: { en: formData.nameEn, es: formData.nameEs },
          description: { en: formData.descEn, es: formData.descEs },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Categories</h1>
        <Button onClick={() => setModalOpen(true)}>
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
                    <img src={category.image} alt={category.name.en} className="h-full w-full object-cover" />
                  ) : (
                    <FolderOpen className="h-10 w-10 text-brown-400" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-brown-900">{category.name.en}</h3>
                      <p className="text-sm text-brown-500">{category.name.es}</p>
                      {category.description.en && (
                        <p className="mt-1 text-sm text-brown-600">{category.description.en}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="icon" size="icon-sm" aria-label="Edit category">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="icon" size="icon-sm" aria-label="Delete category">
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
            <ModalTitle>Add New Category</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-error-500">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Name (English)</label>
              <Input required value={formData.nameEn} onChange={(e) => setFormData((p) => ({ ...p, nameEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Name (Spanish)</label>
              <Input required value={formData.nameEs} onChange={(e) => setFormData((p) => ({ ...p, nameEs: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Description (English)</label>
              <Input value={formData.descEn} onChange={(e) => setFormData((p) => ({ ...p, descEn: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Description (Spanish)</label>
              <Input value={formData.descEs} onChange={(e) => setFormData((p) => ({ ...p, descEs: e.target.value }))} />
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Category"}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
