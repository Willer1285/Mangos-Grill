"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
  Switch,
} from "@/components/ui";
import { ImageIcon, Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
  _id: string;
  image: string;
  caption?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) setItems(await res.json());
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPreviewUrl(data.url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!previewUrl) {
      toast.error("Please upload an image first");
      return;
    }
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: previewUrl, caption, sortOrder: items.length }),
      });
      if (!res.ok) throw new Error();
      toast.success("Image added to gallery");
      setModalOpen(false);
      setPreviewUrl("");
      setCaption("");
      fetchItems();
    } catch {
      toast.error("Failed to save");
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      await fetch(`/api/admin/gallery/${id}`, {
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
    if (!confirm("Delete this gallery image?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Image deleted");
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
          <h1 className="text-3xl font-bold text-brown-900">Gallery</h1>
          <p className="mt-1 text-brown-600">Manage images displayed on the homepage gallery</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : items.length === 0 ? (
        <Card className="border border-cream-200">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <ImageIcon className="h-12 w-12 text-brown-300" />
            <p className="text-brown-500">No gallery images yet</p>
            <Button onClick={() => setModalOpen(true)} variant="secondary">
              <Plus className="h-4 w-4" /> Upload First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden border transition-opacity ${!item.active ? "opacity-50" : ""} border-cream-200`}>
                <div className="relative aspect-square">
                  <Image src={item.image} alt={item.caption || "Gallery"} fill className="object-cover" />
                </div>
                <CardContent className="p-3">
                  {item.caption && (
                    <p className="mb-2 truncate text-sm text-brown-700">{item.caption}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brown-500">Active</span>
                      <Switch
                        checked={item.active}
                        onCheckedChange={(v) => handleToggleActive(item._id, v)}
                      />
                    </div>
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

      {/* Upload Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Gallery Image</ModalTitle>
            <ModalDescription>Upload an image for the homepage gallery section.</ModalDescription>
          </ModalHeader>
          <div className="space-y-4 px-6">
            {previewUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-lg border border-cream-200">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-cream-300 text-brown-400 transition-colors hover:border-terracotta-400"
                onClick={() => document.getElementById("gallery-upload")?.click()}
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm">Click to upload an image</span>
              </div>
            )}
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreviewUrl("");
                  document.getElementById("gallery-upload")?.click();
                }}
              >
                Change Image
              </Button>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Caption (optional)</label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Our beautiful dining area"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setPreviewUrl(""); setCaption(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={uploading}>
              Add to Gallery
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
