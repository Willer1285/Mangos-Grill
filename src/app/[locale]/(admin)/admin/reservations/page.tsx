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
  ModalFooter,
} from "@/components/ui";
import { CalendarDays, Users, Plus, Search, XCircle, Trash2 } from "lucide-react";

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
  table?: { number: number; name: string };
  location: string;
}

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
  location: "Miami",
};

export default function ReservationsManagementPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFilter === "today") {
        params.set("date", new Date().toISOString().split("T")[0]);
      } else if (dateFilter) {
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          date: formData.date,
          time: formData.time,
          partySize: parseInt(formData.partySize),
          location: formData.location,
        }),
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

  const todayCount = reservations.length;
  const guestsExpected = reservations.reduce((sum, r) => sum + r.partySize, 0);

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Reservations", value: todayCount, icon: CalendarDays, color: "bg-terracotta-500/10 text-terracotta-500" },
          { label: "Guests Expected", value: guestsExpected, icon: Users, color: "bg-info-500/10 text-info-500" },
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
                onClick={() => setDateFilter("today")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  dateFilter === "today" ? "bg-terracotta-500 text-white" : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
                }`}
              >
                Today
              </button>
              <Input type="date" value={dateFilter === "today" ? "" : dateFilter} onChange={(e) => setDateFilter(e.target.value || "today")} className="w-auto" />
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

      {/* Table */}
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
                            <select
                              value={res.status}
                              onChange={(e) => handleStatusChange(res._id, e.target.value)}
                              className="h-8 rounded border border-cream-300 bg-white px-2 text-xs text-brown-900 focus:border-terracotta-500 focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Seated">Seated</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="No-show">No-show</option>
                            </select>
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
          </ModalHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-sm text-error-500">{error}</p>}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brown-700">Guest Name</label>
              <Input required value={formData.guestName} onChange={(e) => setFormData((p) => ({ ...p, guestName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Email</label>
                <Input type="email" value={formData.guestEmail} onChange={(e) => setFormData((p) => ({ ...p, guestEmail: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Phone</label>
                <Input value={formData.guestPhone} onChange={(e) => setFormData((p) => ({ ...p, guestPhone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Date</label>
                <Input required type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Time</label>
                <Input required type="time" value={formData.time} onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Party Size</label>
                <Input required type="number" min="1" max="20" value={formData.partySize} onChange={(e) => setFormData((p) => ({ ...p, partySize: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-brown-700">Location</label>
                <Input required value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Reservation"}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
