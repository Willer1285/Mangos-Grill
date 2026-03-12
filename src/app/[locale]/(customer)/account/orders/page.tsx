"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import {
  Package,
  RotateCcw,
  MapPin,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";

/* ── Types ───────────────────────────────────────────────── */
type OrderStatus = "new" | "preparing" | "delivered" | "cancelled";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

/* ── Filter tabs ─────────────────────────────────────────── */
const filters: { id: OrderStatus | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Orders", icon: Package },
  { id: "new", label: "New", icon: Clock },
  { id: "preparing", label: "Preparing", icon: ChefHat },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
  { id: "cancelled", label: "Cancelled", icon: XCircle },
];

/* ── Mock order data ─────────────────────────────────────── */
const mockOrders: Order[] = [
  {
    id: "MG-A1B2C3",
    date: "Feb 28, 2026",
    items: [
      { name: "Arepa Reina Pepiada", qty: 2, price: 12.99 },
      { name: "Pabellon Bowl", qty: 1, price: 16.95 },
    ],
    total: 42.93,
    status: "new",
  },
  {
    id: "MG-D4E5F6",
    date: "Feb 25, 2026",
    items: [
      { name: "Tequeños (6pc)", qty: 1, price: 9.99 },
      { name: "Cachapa con Queso", qty: 1, price: 13.99 },
      { name: "Chicha Venezolana", qty: 2, price: 5.99 },
    ],
    total: 35.96,
    status: "preparing",
  },
  {
    id: "MG-G7H8I9",
    date: "Feb 20, 2026",
    items: [
      { name: "Asado Negro", qty: 1, price: 18.99 },
      { name: "Tres Leches Cake", qty: 1, price: 8.99 },
    ],
    total: 27.98,
    status: "delivered",
  },
  {
    id: "MG-J1K2L3",
    date: "Feb 15, 2026",
    items: [
      { name: "Empanadas (3 pcs)", qty: 2, price: 10.99 },
      { name: "Patacon Maracucho", qty: 1, price: 14.99 },
    ],
    total: 36.97,
    status: "delivered",
  },
  {
    id: "MG-M4N5O6",
    date: "Feb 10, 2026",
    items: [
      { name: "Arepa Domino", qty: 1, price: 11.99 },
      { name: "Pabellon Criollo", qty: 1, price: 16.95 },
      { name: "Tres Leches Cake", qty: 1, price: 8.99 },
    ],
    total: 37.93,
    status: "cancelled",
  },
];

/* ── Status → icon mapping ───────────────────────────────── */
const statusIcon: Record<OrderStatus, React.ElementType> = {
  new: Clock,
  preparing: ChefHat,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const t = useTranslations("customer");
  const { currency } = useBrand();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders =
    activeFilter === "all"
      ? mockOrders
      : mockOrders.filter((o) => o.status === activeFilter);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">
          Order History
        </h1>
        <p className="mt-1 text-sm text-brown-600">
          View and manage your past and current orders.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-terracotta-500 text-white"
                  : "border border-cream-300 bg-white text-brown-700 hover:bg-cream-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <Package className="mb-3 h-10 w-10 text-cream-400" />
              <p className="text-sm font-medium text-brown-900">
                No orders found
              </p>
              <p className="mt-1 text-xs text-brown-600">
                Orders matching this filter will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {filteredOrders.map((order, i) => {
          const StatusIcon = statusIcon[order.status];

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                        <StatusIcon className="h-5 w-5 text-terracotta-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brown-900">
                          {order.id}
                        </p>
                        <p className="text-xs text-brown-600">{order.date}</p>
                      </div>
                    </div>
                    <Badge variant={order.status}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Items list */}
                  <div className="mt-4 divide-y divide-cream-200">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="text-brown-900">
                          {item.name}{" "}
                          <span className="text-brown-500">x{item.qty}</span>
                        </span>
                        <span className="font-medium text-brown-900">
                          {formatPrice(item.price * item.qty, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-4">
                    <p className="text-sm text-brown-600">
                      Total:{" "}
                      <span className="text-base font-semibold text-brown-900">
                        {formatPrice(order.total, currency)}
                      </span>
                    </p>

                    <div className="flex gap-2">
                      {order.status === "delivered" && (
                        <Button variant="primary" size="sm">
                          <RotateCcw className="h-4 w-4" />
                          Reorder
                        </Button>
                      )}
                      {(order.status === "new" ||
                        order.status === "preparing") && (
                        <Button variant="secondary" size="sm">
                          <MapPin className="h-4 w-4" />
                          Track Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
