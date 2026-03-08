"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Button,
  Input,
  Textarea,
  Spinner,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui";
import { HelpCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { autoTranslate } from "@/lib/utils/translate";

interface FAQ {
  _id: string;
  question: { en: string; es: string };
  answer: { en: string; es: string };
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export default function FAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) setItems(await res.json());
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(item: FAQ) {
    setEditingId(item._id);
    setForm({
      question: item.question.en,
      answer: item.answer.en,
      sortOrder: item.sortOrder,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    setSaving(true);
    try {
      const translations = await autoTranslate([form.question, form.answer]);
      const payload = {
        question: translations[0],
        answer: translations[1],
        sortOrder: form.sortOrder,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/faqs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("FAQ updated");
      } else {
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        toast.success("FAQ created");
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await fetch(`/api/admin/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, active } : item)));
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-900">FAQs</h1>
          <p className="mt-1 text-brown-600">Manage frequently asked questions displayed on the homepage</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : items.length === 0 ? (
        <Card className="border border-cream-200">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <HelpCircle className="h-12 w-12 text-brown-300" />
            <p className="text-brown-500">No FAQs yet</p>
            <Button onClick={openNew} variant="secondary">
              <Plus className="h-4 w-4" /> Create First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className={`border transition-opacity ${!item.active ? "opacity-50" : ""} border-cream-200`}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta-500/10">
                    <HelpCircle className="h-4 w-4 text-terracotta-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-brown-900">{item.question.en}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-brown-600">{item.answer.en}</p>
                    {item.question.es && (
                      <p className="mt-1 text-xs text-brown-400">ES: {item.question.es}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Switch
                      checked={item.active}
                      onCheckedChange={(v) => handleToggleActive(item._id, v)}
                    />
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="text-error-500 hover:bg-error-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editingId ? "Edit FAQ" : "New FAQ"}</ModalTitle>
            <ModalDescription>
              {editingId ? "Update this frequently asked question." : "Create a new FAQ. It will be auto-translated to Spanish."}
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 px-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Question</label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. Do you offer vegetarian options?"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Answer</label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Write the answer here..."
                rows={4}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Sort Order</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingId ? "Update" : "Create"} FAQ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
