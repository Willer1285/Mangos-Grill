"use client";

import { useState } from "react";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { ChevronDown, ChevronUp, Plus, Eye, Package } from "lucide-react";

/* ── Mock data ── */
const orders = [
  {
    id: "MG-A1B2C3",
    customer: "John Doe",
    items: "Arepa Reina, Pabellon Criollo, Jugo de Guayaba",
    total: 38.5,
    status: "new" as const,
    date: "2026-03-02",
    details: {
      lineItems: [
        { name: "Arepa Reina", qty: 1, price: 12.5 },
        { name: "Pabellon Criollo", qty: 1, price: 18.0 },
        { name: "Jugo de Guayaba", qty: 1, price: 8.0 },
      ],
      delivery: { type: "Delivery", address: "123 Main St, Miami, FL 33101" },
      payment: { method: "Credit Card", reference: "TXN-CC-98712" },
    },
  },
  {
    id: "MG-D4E5F6",
    customer: "Ana Lopez",
    items: "Tequeños (6), Cachapa con Queso, Tres Leches",
    total: 32.0,
    status: "preparing" as const,
    date: "2026-03-02",
    details: {
      lineItems: [
        { name: "Tequeños (6)", qty: 1, price: 10.0 },
        { name: "Cachapa con Queso", qty: 1, price: 14.0 },
        { name: "Tres Leches", qty: 1, price: 8.0 },
      ],
      delivery: { type: "Dine-in", address: "Table #7" },
      payment: { method: "Zelle", reference: "ZEL-20260302-001" },
    },
  },
  {
    id: "MG-G7H8I9",
    customer: "Carlos Rivera",
    items: "Asado Negro, Ensalada Caesar, Agua Mineral",
    total: 42.75,
    status: "ready" as const,
    date: "2026-03-01",
    details: {
      lineItems: [
        { name: "Asado Negro", qty: 1, price: 24.0 },
        { name: "Ensalada Caesar", qty: 1, price: 12.75 },
        { name: "Agua Mineral", qty: 1, price: 6.0 },
      ],
      delivery: { type: "Pickup", address: "N/A" },
      payment: { method: "Credit Card", reference: "TXN-CC-98745" },
    },
  },
  {
    id: "MG-J1K2L3",
    customer: "Maria Gonzalez",
    items: "Empanadas (4), Patacon, Chicha",
    total: 28.5,
    status: "delivered" as const,
    date: "2026-03-01",
    details: {
      lineItems: [
        { name: "Empanadas (4)", qty: 1, price: 14.0 },
        { name: "Patacon", qty: 1, price: 9.0 },
        { name: "Chicha", qty: 1, price: 5.5 },
      ],
      delivery: { type: "Delivery", address: "456 Ocean Dr, Miami, FL 33139" },
      payment: { method: "Binance Pay", reference: "BNB-3A7F2" },
    },
  },
  {
    id: "MG-M4N5O6",
    customer: "Luis Perez",
    items: "Pabellon Bowl, Tequeños (4)",
    total: 22.99,
    status: "cancelled" as const,
    date: "2026-02-28",
    details: {
      lineItems: [
        { name: "Pabellon Bowl", qty: 1, price: 16.99 },
        { name: "Tequeños (4)", qty: 1, price: 6.0 },
      ],
      delivery: { type: "Delivery", address: "789 Brickell Ave, Miami, FL 33131" },
      payment: { method: "Credit Card", reference: "TXN-CC-98700 (Refunded)" },
    },
  },
  {
    id: "MG-P7Q8R9",
    customer: "Sofia Martinez",
    items: "Hallaca, Pernil, Ensalada Navideña, Ponche",
    total: 56.0,
    status: "new" as const,
    date: "2026-03-02",
    details: {
      lineItems: [
        { name: "Hallaca", qty: 2, price: 24.0 },
        { name: "Pernil", qty: 1, price: 18.0 },
        { name: "Ensalada Navideña", qty: 1, price: 8.0 },
        { name: "Ponche Crema", qty: 1, price: 6.0 },
      ],
      delivery: { type: "Delivery", address: "321 Coral Way, Miami, FL 33145" },
      payment: { method: "Zelle", reference: "ZEL-20260302-004" },
    },
  },
];

type StatusFilter = "all" | "new" | "preparing" | "ready" | "delivered" | "cancelled";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const statusLabels: Record<string, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersManagementPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCounts = (status: StatusFilter) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Orders Management</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.key}
            onClick={() => setFilter(sf.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === sf.key
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
            }`}
          >
            {sf.label}
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold ${
                filter === sf.key
                  ? "bg-white/20 text-white"
                  : "bg-cream-200 text-brown-600"
              }`}
            >
              {getCounts(sf.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500" />
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Order #</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Items</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Total</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-brown-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-brown-500">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-brown-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const isExpanded = expandedRows.has(order.id);
                  return (
                    <>
                      <tr
                        key={order.id}
                        className="cursor-pointer border-b border-cream-100 transition-colors hover:bg-cream-50"
                        onClick={() => toggleRow(order.id)}
                      >
                        <td className="px-5 py-3 text-brown-400">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                        <td className="px-5 py-3 font-medium text-brown-900">{order.id}</td>
                        <td className="px-5 py-3 text-brown-700">{order.customer}</td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-brown-600">
                          {order.items}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-brown-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={order.status}>{statusLabels[order.status]}</Badge>
                        </td>
                        <td className="px-5 py-3 text-brown-600">{order.date}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon-sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm">
                              <Package className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <tr key={`${order.id}-details`} className="border-b border-cream-100 bg-cream-50/50">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Order Items */}
                              <div>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">
                                  Order Details
                                </h4>
                                <ul className="space-y-1">
                                  {order.details.lineItems.map((item) => (
                                    <li key={item.name} className="flex justify-between text-sm">
                                      <span className="text-brown-700">
                                        {item.qty}x {item.name}
                                      </span>
                                      <span className="font-medium text-brown-900">
                                        ${item.price.toFixed(2)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Delivery Info */}
                              <div>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">
                                  Delivery Info
                                </h4>
                                <p className="text-sm text-brown-700">
                                  <span className="font-medium">Type:</span>{" "}
                                  {order.details.delivery.type}
                                </p>
                                <p className="text-sm text-brown-700">
                                  <span className="font-medium">Address:</span>{" "}
                                  {order.details.delivery.address}
                                </p>
                              </div>

                              {/* Payment Info */}
                              <div>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">
                                  Payment Info
                                </h4>
                                <p className="text-sm text-brown-700">
                                  <span className="font-medium">Method:</span>{" "}
                                  {order.details.payment.method}
                                </p>
                                <p className="text-sm text-brown-700">
                                  <span className="font-medium">Reference:</span>{" "}
                                  {order.details.payment.reference}
                                </p>
                              </div>
                            </div>

                            {/* Expanded Actions */}
                            <div className="mt-4 flex gap-2">
                              <Button variant="secondary" size="sm">
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Package className="h-4 w-4" />
                                Change Status
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
