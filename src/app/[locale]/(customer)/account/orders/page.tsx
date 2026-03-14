"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Skeleton } from "@/components/ui";
import {
  Package,
  RotateCcw,
  MapPin,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";
import { Link } from "@/i18n/navigation";

type OrderStatus = "New" | "Preparing" | "Ready" | "InTransit" | "Delivered" | "Cancelled";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus: string;
}

const filters: { id: OrderStatus | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Orders", icon: Package },
  { id: "New", label: "New", icon: Clock },
  { id: "Preparing", label: "Preparing", icon: ChefHat },
  { id: "Delivered", label: "Delivered", icon: CheckCircle2 },
  { id: "Cancelled", label: "Cancelled", icon: XCircle },
];

const statusIcon: Record<string, React.ElementType> = {
  New: Clock,
  Preparing: ChefHat,
  Ready: CheckCircle2,
  InTransit: MapPin,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};

function getStatusVariant(status: string) {
  switch (status) {
    case "Delivered": return "delivered" as const;
    case "Cancelled": return "cancelled" as const;
    case "New": case "Preparing": case "Ready": case "InTransit": return "active" as const;
    default: return "default" as const;
  }
}

export default function OrdersPage() {
  const t = useTranslations("customer");
  const { currency } = useBrand();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/account/orders?limit=50");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchOrders();
  }, []);

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">Order History</h1>
        <p className="mt-1 text-sm text-brown-600">View and manage your past and current orders.</p>
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
              <ShoppingBag className="mb-3 h-10 w-10 text-cream-400" />
              <p className="text-sm font-medium text-brown-900">
                {orders.length === 0 ? "No orders yet" : "No orders found"}
              </p>
              <p className="mt-1 text-xs text-brown-600">
                {orders.length === 0 ? (
                  <Link href="/menu" className="text-terracotta-500 hover:text-terracotta-600">
                    Browse our menu to place your first order
                  </Link>
                ) : (
                  "Orders matching this filter will appear here."
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {filteredOrders.map((order, i) => {
          const StatusIcon = statusIcon[order.status] || Package;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                        <StatusIcon className="h-5 w-5 text-terracotta-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brown-900">{order.id}</p>
                        <p className="text-xs text-brown-600">
                          {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="mt-4 divide-y divide-cream-200">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-brown-900">
                          {item.name} <span className="text-brown-500">x{item.quantity}</span>
                        </span>
                        <span className="font-medium text-brown-900">
                          {formatPrice(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-4">
                    <p className="text-sm text-brown-600">
                      Total: <span className="text-base font-semibold text-brown-900">{formatPrice(order.total, currency)}</span>
                    </p>
                    <div className="flex gap-2">
                      {order.status === "Delivered" && (
                        <Button variant="primary" size="sm">
                          <RotateCcw className="h-4 w-4" />
                          Reorder
                        </Button>
                      )}
                      {(order.status === "New" || order.status === "Preparing" || order.status === "InTransit") && (
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
