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
  Badge,
  ImageUpload,
} from "@/components/ui";
import { MapPin, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

interface Table {
  _id: string;
  number: number;
  capacity: number;
  location: string;
}

interface Location {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  image?: string;
  tables: Table[];
}

const EMPTY_FORM = {
  name: "",
  address: "",
  phone: "",
  image: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Track which location cards have their table section expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // New table inline form state keyed by location id
  const [newTableData, setNewTableData] = useState<
    Record<string, { number: string; capacity: string }>
  >({});
  const [addingTableFor, setAddingTableFor] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLocations(data);
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Location CRUD ──

  function openCreate() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(loc: Location) {
    setEditingId(loc._id);
    setFormData({
      name: loc.name,
      address: loc.address,
      phone: loc.phone,
      image: loc.image || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload: Record<string, string> = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
    };
    if (formData.image) payload.image = formData.image;
    try {
      const url = editingId
        ? `/api/admin/locations/${editingId}`
        : "/api/admin/locations";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save location");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this location? All associated tables will also be removed.")) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      fetchLocations();
    } catch {
      alert("Failed to delete location");
    }
  }

  // ── Table CRUD ──

  async function handleAddTable(location: Location) {
    const data = newTableData[location._id];
    if (!data || !data.number || !data.capacity) return;
    setAddingTableFor(location._id);
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: parseInt(data.number),
          capacity: parseInt(data.capacity),
          position: { x: 0, y: 0 },
          location: location.name,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to add table");
        return;
      }
      // Clear the inline form and refetch
      setNewTableData((prev) => {
        const next = { ...prev };
        delete next[location._id];
        return next;
      });
      fetchLocations();
    } catch {
      alert("Failed to add table");
    } finally {
      setAddingTableFor(null);
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm("Delete this table?")) return;
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete table");
        return;
      }
      fetchLocations();
    } catch {
      alert("Failed to delete table");
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-brown-900">Locations</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : locations.length === 0 ? (
        <div className="py-20 text-center text-brown-500">
          No locations yet. Create your first one.
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {locations.map((location) => {
            const isExpanded = expandedIds.has(location._id);
            const tableForm = newTableData[location._id] || { number: "", capacity: "" };

            return (
              <motion.div key={location._id} variants={itemVariants}>
                <Card className="overflow-hidden border border-cream-200">
                  {/* Location image / placeholder */}
                  <div className="flex h-40 items-center justify-center bg-cream-200">
                    {location.image ? (
                      <img
                        src={location.image}
                        alt={location.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MapPin className="h-10 w-10 text-brown-400" />
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Info row */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-brown-900">
                          {location.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-brown-600">
                          {location.address}
                        </p>
                        {location.phone && (
                          <p className="mt-0.5 text-sm text-brown-500">
                            {location.phone}
                          </p>
                        )}
                        <div className="mt-2">
                          <Badge variant="default">
                            {location.tables.length}{" "}
                            {location.tables.length === 1 ? "table" : "tables"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="icon"
                          size="icon-sm"
                          aria-label="Edit location"
                          onClick={() => openEdit(location)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="icon"
                          size="icon-sm"
                          aria-label="Delete location"
                          onClick={() => handleDelete(location._id)}
                        >
                          <Trash2 className="h-4 w-4 text-error-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Expand / Collapse toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(location._id)}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-cream-200 py-1.5 text-xs font-medium text-brown-500 transition-colors hover:bg-cream-100"
                    >
                      {isExpanded ? (
                        <>
                          Hide Tables <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Manage Tables <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>

                    {/* Expandable table management section */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {/* Existing tables */}
                        {location.tables.length > 0 ? (
                          <div className="overflow-hidden rounded-md border border-cream-200">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-cream-200 bg-cream-100/60">
                                  <th className="px-3 py-2 text-left text-xs font-medium text-brown-500">
                                    Number
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-brown-500">
                                    Capacity
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-brown-500">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {location.tables.map((table) => (
                                  <tr
                                    key={table._id}
                                    className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50"
                                  >
                                    <td className="px-3 py-2 font-medium text-brown-900">
                                      T-{table.number}
                                    </td>
                                    <td className="px-3 py-2 text-brown-600">
                                      {table.capacity} seats
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Delete table"
                                        onClick={() => handleDeleteTable(table._id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-error-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="py-3 text-center text-xs text-brown-400">
                            No tables yet
                          </p>
                        )}

                        {/* Add table row */}
                        <div className="flex items-end gap-2">
                          <Input
                            label="Number"
                            type="number"
                            min="1"
                            placeholder="#"
                            value={tableForm.number}
                            onChange={(e) =>
                              setNewTableData((prev) => ({
                                ...prev,
                                [location._id]: {
                                  ...tableForm,
                                  number: e.target.value,
                                },
                              }))
                            }
                            className="w-20"
                          />
                          <Input
                            label="Capacity"
                            type="number"
                            min="1"
                            placeholder="Seats"
                            value={tableForm.capacity}
                            onChange={(e) =>
                              setNewTableData((prev) => ({
                                ...prev,
                                [location._id]: {
                                  ...tableForm,
                                  capacity: e.target.value,
                                },
                              }))
                            }
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddTable(location)}
                            loading={addingTableFor === location._id}
                            disabled={!tableForm.number || !tableForm.capacity}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Table
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create / Edit Location Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingId ? "Edit Location" : "Add New Location"}
            </ModalTitle>
            <ModalDescription>
              {editingId
                ? "Update the location details and photo."
                : "Add a new restaurant location with its details."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">
                Photo
              </p>
              <ImageUpload
                label="Location Image"
                value={formData.image}
                onChange={(url) =>
                  setFormData((p) => ({ ...p, image: url }))
                }
              />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">
                Location Details
              </p>
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Downtown Miami"
              />
              <Input
                label="Address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="e.g. 123 Main St, Miami, FL"
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="e.g. (305) 555-1234"
              />
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {editingId ? "Save Changes" : "Create Location"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
