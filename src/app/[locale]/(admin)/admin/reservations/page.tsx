"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { CalendarDays, Users, Percent, XCircle, Plus, Search, Edit2 } from "lucide-react";

/* ── Mock KPI data ── */
const kpis = [
  { label: "Today's Reservations", value: 12, icon: CalendarDays, color: "bg-terracotta-500/10 text-terracotta-500" },
  { label: "Guests Expected", value: 48, icon: Users, color: "bg-info-500/10 text-info-500" },
  { label: "Capacity", value: "72%", icon: Percent, color: "bg-success-500/10 text-success-500" },
  { label: "Cancellations", value: 2, icon: XCircle, color: "bg-error-500/10 text-error-500" },
] as const;

/* ── Mock reservation data ── */
const reservations = [
  { id: "R-001", guest: "John Doe", partySize: 4, date: "2026-03-02", time: "7:00 PM", status: "confirmed" as const, table: "T-5" },
  { id: "R-002", guest: "Ana Lopez", partySize: 2, date: "2026-03-02", time: "7:30 PM", status: "pending" as const, table: "T-3" },
  { id: "R-003", guest: "Carlos Rivera", partySize: 6, date: "2026-03-02", time: "8:00 PM", status: "seated" as const, table: "T-12" },
  { id: "R-004", guest: "Maria Gonzalez", partySize: 3, date: "2026-03-02", time: "6:30 PM", status: "completed" as const, table: "T-8" },
  { id: "R-005", guest: "Luis Perez", partySize: 2, date: "2026-03-02", time: "8:30 PM", status: "cancelled" as const, table: "T-2" },
  { id: "R-006", guest: "Sofia Martinez", partySize: 8, date: "2026-03-03", time: "7:00 PM", status: "pending" as const, table: "T-15" },
];

type StatusFilter = "all" | "pending" | "confirmed" | "seated" | "completed" | "cancelled";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "seated", label: "Seated" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
  cancelled: "Cancelled",
};

const totalSeats = 72;
const bookedSeats = 48;

export default function ReservationsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery && !r.guest.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateFilter === "today" && r.date !== "2026-03-02") return false;
    if (dateFilter !== "today" && dateFilter !== "" && r.date !== dateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Reservations</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
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
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
                <Input
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter("today")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  dateFilter === "today"
                    ? "bg-terracotta-500 text-white"
                    : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
                }`}
              >
                Today
              </button>
              <Input
                type="date"
                value={dateFilter === "today" ? "" : dateFilter}
                onChange={(e) => setDateFilter(e.target.value || "today")}
                className="w-auto"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex h-10 rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-brown-900 transition-colors focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            >
              {statusFilters.map((sf) => (
                <option key={sf.key} value={sf.key}>
                  {sf.label}
                </option>
              ))}
            </select>

            {/* Seat Badge */}
            <Badge variant="primary" className="h-8 whitespace-nowrap px-3 text-sm">
              {bookedSeats}/{totalSeats} seats booked
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Guest Name</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Party Size</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Time</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Table #</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res) => (
                  <tr key={res.id} className="border-b border-cream-100 last:border-0 transition-colors hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-brown-900">{res.guest}</td>
                    <td className="px-5 py-3 text-center text-brown-700">{res.partySize}</td>
                    <td className="px-5 py-3 text-brown-600">{res.date}</td>
                    <td className="px-5 py-3 text-brown-600">{res.time}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={res.status}>{statusLabels[res.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-brown-700">{res.table}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-error-500 hover:text-error-600">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-brown-500">
                      No reservations found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
