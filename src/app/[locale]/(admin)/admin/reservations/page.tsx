"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Spinner,
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
  Textarea,
} from "@/components/ui";
import { CalendarDays, Users, Plus, Search, XCircle, Trash2, MapPin, Pencil, CheckCircle2, Clock, Eye } from "lucide-react";

interface Reservation {
  _id: string;
  customer?: { firstName: string; lastName: string };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  date: string;
  time: string;
  partySize: number;
  status: "Pending" | "Confirmed" | "Seated" | "Completed" | "Cancelled" | "No-show";
  table?: { _id: string; number: number; name: string; capacity: number };
  location: string;
  occasion?: string;
  specialRequests?: string;
}

interface TableInfo {
  _id: string;
  number: number;
  capacity: number;
  name: string;
  status: string;
  shape: string;
}

interface Location {
  _id: string;
  name: string;
  tables: TableInfo[];
}

const OCCASIONS = [
  "Romantic",
  "Family",
  "Business",
  "Birthday",
  "Anniversary",
  "Wedding Anniversary",
  "Graduation",
  "Friends Gathering",
  "Baby Shower",
  "Engagement",
  "Promotion",
  "Farewell",
  "Holiday Celebration",
  "Corporate Event",
  "Baptism",
  "Date Night",
  "Retirement",
  "Casual Dining",
  "Reunion",
  "Other",
];

type StatusFilter = "All" | "Pending" | "Confirmed" | "Seated" | "Completed" | "Cancelled";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Seated", label: "Seated" },
  { key: "Completed", label: "Completed" },
  { key: "Cancelled", label: "Cancelled" },
];

const badgeVariant: Record<string, string> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Seated: "info",
  Completed: "completed",
  Cancelled: "cancelled",
  "No-show": "error",
};

const EMPTY_FORM = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  date: "",
  time: "",
  partySize: "2",
  location: "",
  table: "",
  occasion: "",
  specialRequests: "",
};

export default function ReservationsManagementPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);

  // View reservation modal
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);

  // Table map modal
  const [tableMapLocation, setTableMapLocation] = useState<Location | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState("");
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFilter === "today") {
        params.set("date", new Date().toISOString().split("T")[0]);
      } else if (dateFilter && dateFilter !== "all") {
        params.set("date", dateFilter);
      }

      const res = await fetch(`/api/admin/reservations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReservations(data);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, dateFilter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/admin/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
        }
      } catch {
        /* empty */
      }
    }
    fetchLocations();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        date: formData.date,
        time: formData.time,
        partySize: parseInt(formData.partySize),
        location: formData.location,
      };
      if (formData.table) body.table = formData.table;
      if (formData.occasion) body.occasion = formData.occasion;
      if (formData.specialRequests) body.specialRequests = formData.specialRequests;
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create reservation");
      }
      setModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError("");
    try {
      const body: Record<string, unknown> = {
        guestName: editData.guestName,
        guestEmail: editData.guestEmail,
        guestPhone: editData.guestPhone,
        date: editData.date,
        time: editData.time,
        partySize: parseInt(editData.partySize),
        location: editData.location,
      };
      if (editData.table) body.table = editData.table;
      else body.$unset = { table: "" };
      if (editData.occasion) body.occasion = editData.occasion;
      if (editData.specialRequests) body.specialRequests = editData.specialRequests;
      const res = await fetch(`/api/admin/reservations/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update reservation");
      }
      setEditModalOpen(false);
      setEditData(EMPTY_FORM);
      setEditId("");
      fetchReservations();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error");
    } finally {
      setEditSubmitting(false);
    }
  }

  function openEditModal(reservation: Reservation) {
    const dateStr = reservation.date
      ? new Date(reservation.date).toISOString().split("T")[0]
      : "";
    setEditData({
      guestName: reservation.guestName || (reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : ""),
      guestEmail: reservation.guestEmail || "",
      guestPhone: reservation.guestPhone || "",
      date: dateStr,
      time: reservation.time || "",
      partySize: String(reservation.partySize),
      location: reservation.location || "",
      table: reservation.table?._id || "",
      occasion: reservation.occasion || "",
      specialRequests: reservation.specialRequests || "",
    });
    setEditId(reservation._id);
    setEditError("");
    setEditModalOpen(true);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchReservations();
    } catch {
      /* empty */
    }
  }

  async function handleDeleteRes(id: string) {
    if (!confirm("Are you sure you want to delete this reservation?")) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" });
      if (res.ok) fetchReservations();
      else alert("Failed to delete reservation");
    } catch {
      alert("Failed to delete reservation");
    }
  }

  // Determine which tables at a location are reserved (active reservations today)
  function getReservedTableIds(locationName: string): Set<string> {
    const activeStatuses = new Set(["Pending", "Confirmed", "Seated"]);
    const reserved = new Set<string>();
    for (const r of reservations) {
      if (r.location === locationName && activeStatuses.has(r.status) && r.table?._id) {
        reserved.add(r.table._id);
      }
    }
    return reserved;
  }

  // Get the reservation info for a reserved table
  function getTableReservation(tableId: string, locationName: string): Reservation | undefined {
    const activeStatuses = new Set(["Pending", "Confirmed", "Seated"]);
    return reservations.find(
      (r) => r.location === locationName && activeStatuses.has(r.status) && r.table?._id === tableId
    );
  }

  const todayCount = reservations.length;
  const guestsExpected = reservations.reduce((sum, r) => sum + r.partySize, 0);

  // Shared form fields renderer
  function renderFormFields(
    data: typeof EMPTY_FORM,
    setData: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  ) {
    return (
      <>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Guest Information</p>
          <Input label="Guest Name" required value={data.guestName} onChange={(e) => setData((p) => ({ ...p, guestName: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={data.guestEmail} onChange={(e) => setData((p) => ({ ...p, guestEmail: e.target.value }))} placeholder="Optional" />
            <Input label="Phone" value={data.guestPhone} onChange={(e) => setData((p) => ({ ...p, guestPhone: e.target.value }))} placeholder="Optional" />
          </div>
        </div>

        <div className="border-t border-cream-200" />

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Reservation Details</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" required type="date" value={data.date} onChange={(e) => setData((p) => ({ ...p, date: e.target.value }))} />
            <Input label="Time" required type="time" value={data.time} onChange={(e) => setData((p) => ({ ...p, time: e.target.value }))} />
          </div>
          <Input label="Party Size" required type="number" min="1" max="20" value={data.partySize} onChange={(e) => setData((p) => ({ ...p, partySize: e.target.value }))} />
        </div>

        <div className="border-t border-cream-200" />

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Location & Table</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brown-700">Location <span className="text-error-500">*</span></label>
            <Select value={data.location} onValueChange={(v) => setData((p) => ({ ...p, location: v, table: "" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc._id} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {data.location && (() => {
            const selectedLocation = locations.find((l) => l.name === data.location);
            if (!selectedLocation || selectedLocation.tables.length === 0) return null;
            return (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Assign Table</label>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.tables.map((t) => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => setData((p) => ({ ...p, table: p.table === t._id ? "" : t._id }))}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        data.table === t._id
                          ? "border-terracotta-500 bg-terracotta-500 text-white"
                          : "border-cream-300 bg-white text-brown-700 hover:border-terracotta-300 hover:bg-terracotta-50"
                      }`}
                    >
                      T-{t.number} <span className="text-xs opacity-75">({t.capacity}p)</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="border-t border-cream-200" />

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Occasion & Notes</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brown-700">Occasion</label>
            <Select value={data.occasion} onValueChange={(v) => setData((p) => ({ ...p, occasion: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select an occasion (optional)" />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brown-700">Special Requests</label>
            <Textarea
              placeholder="Any special requests or notes..."
              value={data.specialRequests}
              onChange={(e) => setData((p) => ({ ...p, specialRequests: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Reservations</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Reservations", value: todayCount, icon: CalendarDays, color: "bg-terracotta-500/10 text-terracotta-500" },
          { label: "Guests Expected", value: guestsExpected, icon: Users, color: "bg-info-500/10 text-info-500" },
          { label: "Confirmed", value: reservations.filter((r) => r.status === "Confirmed").length, icon: CheckCircle2, color: "bg-success-500/10 text-success-500" },
          { label: "Pending", value: reservations.filter((r) => r.status === "Pending").length, icon: Clock, color: "bg-warning-500/10 text-warning-500" },
          { label: "Cancellations", value: reservations.filter((r) => r.status === "Cancelled").length, icon: XCircle, color: "bg-error-500/10 text-error-500" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-brown-900">{kpi.value}</p>
                <p className="text-xs text-brown-500">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
                <Input placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter("")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  !dateFilter || dateFilter === "all" ? "bg-terracotta-500 text-white" : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDateFilter("today")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  dateFilter === "today" ? "bg-terracotta-500 text-white" : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
                }`}
              >
                Today
              </button>
              <Input type="date" value={dateFilter === "today" || !dateFilter ? "" : dateFilter} onChange={(e) => setDateFilter(e.target.value || "")} className="w-auto" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex h-10 rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-brown-900 transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            >
              {statusFilters.map((sf) => (
                <option key={sf.key} value={sf.key}>{sf.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Location Buttons */}
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {locations.map((loc) => {
            const reservedCount = getReservedTableIds(loc.name).size;
            const totalTables = loc.tables.length;
            return (
              <button
                key={loc._id}
                onClick={() => setTableMapLocation(loc)}
                className="group flex items-center gap-2.5 rounded-xl border border-cream-200 bg-white px-4 py-3 text-left transition-all hover:border-terracotta-300 hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-500/10 text-terracotta-500 transition-colors group-hover:bg-terracotta-500 group-hover:text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brown-900">{loc.name}</p>
                  <p className="text-xs text-brown-500">
                    {reservedCount}/{totalTables} tables reserved
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No reservations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Guest Name</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Party Size</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Time</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Table</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => {
                    const guestName = res.customer
                      ? `${res.customer.firstName} ${res.customer.lastName}`
                      : res.guestName || "Unknown";
                    return (
                      <tr key={res._id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                        <td className="px-5 py-3 font-medium text-brown-900">{guestName}</td>
                        <td className="px-5 py-3 text-center text-brown-700">{res.partySize}</td>
                        <td className="px-5 py-3 text-brown-600">{new Date(res.date).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-brown-600">{res.time}</td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={badgeVariant[res.status] as "pending" | "confirmed" | "completed" | "cancelled"}>
                            {res.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-center font-medium text-brown-700">
                          {res.table ? `T-${res.table.number}` : "—"}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Select value={res.status} onValueChange={(v) => handleStatusChange(res._id, v)}>
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Seated">Seated</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                <SelectItem value="No-show">No-show</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon-sm" onClick={() => setViewReservation(res)} title="View details">
                              <Eye className="h-4 w-4 text-brown-500" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(res)}>
                              <Pencil className="h-4 w-4 text-brown-500" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteRes(res._id)}>
                              <Trash2 className="h-4 w-4 text-error-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Reservation Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>New Reservation</ModalTitle>
            <ModalDescription>Book a table for a walk-in or phone guest.</ModalDescription>
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}
            {renderFormFields(formData, setFormData)}
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Create Reservation</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Reservation Modal */}
      <Modal open={editModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Reservation</ModalTitle>
            <ModalDescription>Update reservation details.</ModalDescription>
          </ModalHeader>
          <form onSubmit={handleEdit} className="space-y-6">
            {editError && (
              <div className="rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3 text-sm text-error-600">
                {editError}
              </div>
            )}
            {renderFormFields(editData, setEditData)}
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={editSubmitting}>Save Changes</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Reservation Modal */}
      <Modal open={!!viewReservation} onOpenChange={(open) => { if (!open) setViewReservation(null); }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Reservation Details</ModalTitle>
            <ModalDescription>Full information for this reservation.</ModalDescription>
          </ModalHeader>
          {viewReservation && (() => {
            const gName = viewReservation.customer
              ? `${viewReservation.customer.firstName} ${viewReservation.customer.lastName}`
              : viewReservation.guestName || "Unknown";
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Guest Name</p>
                    <p className="mt-1 text-sm font-medium text-brown-900">{gName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Status</p>
                    <div className="mt-1">
                      <Badge variant={badgeVariant[viewReservation.status] as "pending" | "confirmed" | "completed" | "cancelled"}>
                        {viewReservation.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Email</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.guestEmail || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Phone</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.guestPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Date</p>
                    <p className="mt-1 text-sm text-brown-700">{new Date(viewReservation.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Time</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.time}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Party Size</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.partySize} {viewReservation.partySize === 1 ? "person" : "people"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Location</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Table</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.table ? `T-${viewReservation.table.number} (${viewReservation.table.name})` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Occasion</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.occasion || "—"}</p>
                  </div>
                </div>
                {viewReservation.specialRequests && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brown-400">Special Requests</p>
                    <p className="mt-1 text-sm text-brown-700">{viewReservation.specialRequests}</p>
                  </div>
                )}
              </div>
            );
          })()}
          <ModalFooter>
            <Button variant="secondary" onClick={() => setViewReservation(null)}>Close</Button>
            <Button onClick={() => { if (viewReservation) { setViewReservation(null); openEditModal(viewReservation); } }}>Edit Reservation</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Table Map Modal */}
      <Modal open={!!tableMapLocation} onOpenChange={(open) => { if (!open) setTableMapLocation(null); }}>
        <ModalContent className="sm:max-w-2xl">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-terracotta-500" />
              {tableMapLocation?.name} — Table Map
            </ModalTitle>
            <ModalDescription>
              View table availability at this location. Green = available, Red = reserved.
            </ModalDescription>
          </ModalHeader>

          {tableMapLocation && (() => {
            const reservedIds = getReservedTableIds(tableMapLocation.name);
            const tables = tableMapLocation.tables;

            if (tables.length === 0) {
              return (
                <div className="py-10 text-center text-brown-500">
                  No tables configured for this location.
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-brown-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                    Reserved
                  </span>
                </div>

                {/* Table grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {tables.map((table) => {
                    const isReserved = reservedIds.has(table._id);
                    const reservation = isReserved
                      ? getTableReservation(table._id, tableMapLocation.name)
                      : undefined;
                    const guestName = reservation
                      ? reservation.customer
                        ? `${reservation.customer.firstName} ${reservation.customer.lastName}`
                        : reservation.guestName || "Guest"
                      : null;

                    return (
                      <div
                        key={table._id}
                        className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                          isReserved
                            ? "border-red-300 bg-red-50"
                            : "border-emerald-300 bg-emerald-50"
                        }`}
                      >
                        <div className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${isReserved ? "bg-red-500" : "bg-emerald-500"}`} />
                        <p className={`text-lg font-bold ${isReserved ? "text-red-700" : "text-emerald-700"}`}>
                          T-{table.number}
                        </p>
                        <p className="text-xs text-brown-500">
                          {table.capacity} {table.capacity === 1 ? "person" : "people"}
                        </p>
                        <p className="mt-0.5 text-[10px] capitalize text-brown-400">{table.shape}</p>
                        {isReserved && guestName && (
                          <div className="mt-2 rounded-md bg-red-100 px-2 py-1">
                            <p className="truncate text-[11px] font-medium text-red-700">{guestName}</p>
                            {reservation && (
                              <p className="text-[10px] text-red-500">{reservation.time} · {reservation.partySize}p</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between rounded-lg bg-cream-100 px-4 py-3 text-sm">
                  <span className="text-brown-600">
                    <span className="font-semibold text-emerald-600">{tables.length - reservedIds.size}</span> available
                    {" · "}
                    <span className="font-semibold text-red-600">{reservedIds.size}</span> reserved
                  </span>
                  <span className="text-brown-500">
                    {tables.length} total tables
                  </span>
                </div>
              </div>
            );
          })()}

          <ModalFooter>
            <Button variant="secondary" onClick={() => setTableMapLocation(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
