"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  Pagination,
} from "@/components/ui";
import { ChevronDown, ChevronUp, Eye, Package } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: { firstName: string; lastName: string; email: string };
  items: OrderItem[];
  total: number;
  status: "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";
  deliveryType: "Dine-in" | "Delivery" | "Pickup";
  deliveryAddress?: { street?: string; city?: string };
  tableNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

type StatusFilter = "All" | "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "New", label: "New" },
  { key: "Preparing", label: "Preparing" },
  { key: "Ready", label: "Ready" },
  { key: "Delivered", label: "Delivered" },
  { key: "Cancelled", label: "Cancelled" },
];

const badgeVariant: Record<string, string> = {
  New: "new",
  Preparing: "preparing",
  Ready: "ready",
  InTransit: "info",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const limit = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (filter !== "All") params.set("status", filter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function changeStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch {
      /* empty */
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const nextStatus: Record<string, string> = {
    New: "Preparing",
    Preparing: "Ready",
    Ready: "Delivered",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-brown-900">Orders Management</h1>
        <span className="text-sm text-brown-500">{total} total orders</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.key}
            onClick={() => setFilter(sf.key)}
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === sf.key
                ? "bg-terracotta-500 text-white"
                : "border border-cream-200 bg-white text-brown-600 hover:bg-cream-100"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-brown-500">No orders found</div>
          ) : (
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
                  {orders.map((order) => {
                    const isExpanded = expandedRows.has(order._id);
                    const customerName = order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName}`
                      : "Guest";
                    const itemsSummary = order.items.map((i) => i.name).join(", ");
                    return (
                      <tbody key={order._id}>
                        <tr
                          className="cursor-pointer border-b border-cream-100 transition-colors hover:bg-cream-50"
                          onClick={() => toggleRow(order._id)}
                        >
                          <td className="px-5 py-3 text-brown-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </td>
                          <td className="px-5 py-3 font-medium text-brown-900">{order.orderNumber}</td>
                          <td className="px-5 py-3 text-brown-700">{customerName}</td>
                          <td className="max-w-[200px] truncate px-5 py-3 text-brown-600">{itemsSummary}</td>
                          <td className="px-5 py-3 text-right font-medium text-brown-900">${order.total.toFixed(2)}</td>
                          <td className="px-5 py-3 text-center">
                            <Badge variant={badgeVariant[order.status] as "new" | "preparing" | "ready" | "delivered" | "cancelled"}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-brown-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              {nextStatus[order.status] && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={updatingId === order._id}
                                  onClick={() => changeStatus(order._id, nextStatus[order.status])}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-cream-100 bg-cream-50/50">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Order Details</h4>
                                  <ul className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <li key={idx} className="flex justify-between text-sm">
                                        <span className="text-brown-700">{item.quantity}x {item.name}</span>
                                        <span className="font-medium text-brown-900">${item.subtotal.toFixed(2)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Delivery Info</h4>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Type:</span> {order.deliveryType}</p>
                                  {order.deliveryAddress && (
                                    <p className="text-sm text-brown-700"><span className="font-medium">Address:</span> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                                  )}
                                  {order.tableNumber && (
                                    <p className="text-sm text-brown-700"><span className="font-medium">Table:</span> {order.tableNumber}</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown-500">Payment Info</h4>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                                  <p className="text-sm text-brown-700"><span className="font-medium">Status:</span> {order.paymentStatus}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
