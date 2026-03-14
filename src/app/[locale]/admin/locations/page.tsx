"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Switch,
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
import { MapPin, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Clock, Phone, Mail, MessageCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Table {
  _id: string;
  number: number;
  capacity: number;
  location: string;
}

interface BusinessHoursRow {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface Location {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  image?: string;
  hours?: BusinessHoursRow[];
  isFlagship?: boolean;
  mapCoordinates?: { lat: number; lng: number };
  tables: Table[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_HOURS: BusinessHoursRow[] = DAYS.map((day) => ({
  day,
  open: "11:00 AM",
  close: "10:00 PM",
  closed: false,
}));

const EMPTY_FORM = {
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  whatsapp: "",
  image: "",
  isFlagship: false,
  mapLat: "",
  mapLng: "",
  hours: DEFAULT_HOURS,
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

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
      city: loc.city || "",
      address: loc.address,
      phone: loc.phone,
      email: loc.email || "",
      whatsapp: loc.whatsapp || "",
      image: loc.image || "",
      isFlagship: loc.isFlagship || false,
      mapLat: loc.mapCoordinates?.lat ? String(loc.mapCoordinates.lat) : "",
      mapLng: loc.mapCoordinates?.lng ? String(loc.mapCoordinates.lng) : "",
      hours: loc.hours?.length ? loc.hours : DEFAULT_HOURS,
    });
    setError("");
    setModalOpen(true);
  }

  function updateHours(index: number, field: keyof BusinessHoursRow, value: string | boolean) {
    setFormData((prev) => ({
      ...prev,
      hours: prev.hours.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const mapCoordinates = formData.mapLat && formData.mapLng
      ? { lat: Number(formData.mapLat), lng: Number(formData.mapLng) }
      : undefined;

    const payload: Record<string, unknown> = {
      name: formData.name,
      city: formData.city || formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email || undefined,
      whatsapp: formData.whatsapp || undefined,
      isFlagship: formData.isFlagship,
      hours: formData.hours,
      mapCoordinates,
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-900">Locations</h1>
          <p className="mt-1 text-brown-600">Manage your restaurant branches, contact info, hours, and maps</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

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
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-brown-900">
                            {location.name}
                          </h3>
                          {location.isFlagship && (
                            <Badge variant="default" className="gap-1">
                              <Star className="h-3 w-3" />
                              Flagship
                            </Badge>
                          )}
                        </div>
                        {location.city && (
                          <p className="mt-0.5 text-xs text-brown-500">{location.city}</p>
                        )}
                        <p className="mt-0.5 text-sm text-brown-600">
                          {location.address}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brown-500">
                          {location.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {location.phone}
                            </span>
                          )}
                          {location.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {location.email}
                            </span>
                          )}
                          {location.whatsapp && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" /> {location.whatsapp}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="default">
                            {location.tables.length}{" "}
                            {location.tables.length === 1 ? "table" : "tables"}
                          </Badge>
                          {location.mapCoordinates && (
                            <Badge variant="default" className="gap-1">
                              <MapPin className="h-3 w-3" /> Map
                            </Badge>
                          )}
                          {location.hours && location.hours.length > 0 && (
                            <Badge variant="default" className="gap-1">
                              <Clock className="h-3 w-3" /> Hours
                            </Badge>
                          )}
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

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {location.tables.length > 0 ? (
                          <div className="overflow-hidden rounded-md border border-cream-200">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-cream-200 bg-cream-100/60">
                                  <th className="px-3 py-2 text-left text-xs font-medium text-brown-500">Number</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-brown-500">Capacity</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-brown-500">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {location.tables.map((table) => (
                                  <tr
                                    key={table._id}
                                    className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50"
                                  >
                                    <td className="px-3 py-2 font-medium text-brown-900">T-{table.number}</td>
                                    <td className="px-3 py-2 text-brown-600">{table.capacity} seats</td>
                                    <td className="px-3 py-2 text-right">
                                      <Button variant="ghost" size="icon-sm" aria-label="Delete table" onClick={() => handleDeleteTable(table._id)}>
                                        <Trash2 className="h-3.5 w-3.5 text-error-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="py-3 text-center text-xs text-brown-400">No tables yet</p>
                        )}

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
                                [location._id]: { ...tableForm, number: e.target.value },
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
                                [location._id]: { ...tableForm, capacity: e.target.value },
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
        <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <ModalHeader>
            <ModalTitle>{editingId ? "Edit Location" : "Add New Location"}</ModalTitle>
            <ModalDescription>
              {editingId
                ? "Update the location details, contact info, hours, and map."
                : "Add a new restaurant location with all its details."}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Photo</p>
              <ImageUpload
                label="Location Image"
                value={formData.image}
                onChange={(url) => setFormData((p) => ({ ...p, image: url }))}
              />
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Location Details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Downtown Miami"
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Miami"
                />
              </div>
              <Input
                label="Address"
                required
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="e.g. 123 Main St, Miami, FL 33101"
              />
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isFlagship}
                  onCheckedChange={(val) => setFormData((p) => ({ ...p, isFlagship: val }))}
                />
                <span className="text-sm font-medium text-brown-700">Flagship location</span>
              </div>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Contact Info</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. (305) 555-1234"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. miami@mangosgrill.com"
                />
              </div>
              <div>
                <Input
                  label="WhatsApp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="e.g. +15551234567"
                />
                <p className="mt-1 text-xs text-brown-500">Full number with country code, no spaces</p>
              </div>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Map Coordinates</p>
              <p className="text-xs text-brown-500">Used to display an interactive map on the contact page</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Latitude"
                  value={formData.mapLat}
                  onChange={(e) => setFormData((p) => ({ ...p, mapLat: e.target.value }))}
                  placeholder="e.g. 29.7604"
                />
                <Input
                  label="Longitude"
                  value={formData.mapLng}
                  onChange={(e) => setFormData((p) => ({ ...p, mapLng: e.target.value }))}
                  placeholder="e.g. -95.3698"
                />
              </div>
            </div>

            <div className="border-t border-cream-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Business Hours</p>
              <div className="space-y-2">
                {formData.hours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium text-brown-700">{h.day}</span>
                    <Switch checked={!h.closed} onCheckedChange={(val) => updateHours(i, "closed", !val)} />
                    {h.closed ? (
                      <span className="text-sm text-brown-400">Closed</span>
                    ) : (
                      <>
                        <Input
                          value={h.open}
                          onChange={(e) => updateHours(i, "open", e.target.value)}
                          className="max-w-[130px]"
                          placeholder="11:00 AM"
                        />
                        <span className="text-brown-500">-</span>
                        <Input
                          value={h.close}
                          onChange={(e) => updateHours(i, "close", e.target.value)}
                          className="max-w-[130px]"
                          placeholder="10:00 PM"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
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
