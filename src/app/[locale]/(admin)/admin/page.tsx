"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Spinner } from "@/components/ui";
import {
  ClipboardList,
  DollarSign,
  Users,
  CalendarDays,
  Plus,
  UtensilsCrossed,
  FileDown,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Order {
  _id: string;
  orderNumber: string;
  customer?: { firstName: string; lastName: string };
  items: { name: string }[];
  total: number;
  status: string;
  createdAt: string;
}

interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  pendingReservations: number;
  recentOrders: Order[];
}

const badgeVariant: Record<string, string> = {
  New: "new",
  Preparing: "preparing",
  Ready: "ready",
  InTransit: "info",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const [ordersRes, usersRes, reservationsRes] = await Promise.all([
          fetch("/api/admin/orders?limit=5"),
          fetch("/api/admin/users?limit=1"),
          fetch("/api/admin/reservations?status=Pending"),
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [], total: 0 };
        const usersData = usersRes.ok ? await usersRes.json() : { total: 0 };
        const reservationsData = reservationsRes.ok ? await reservationsRes.json() : [];

        setData({
          totalOrders: ordersData.total,
          totalUsers: usersData.total,
          pendingReservations: Array.isArray(reservationsData) ? reservationsData.length : 0,
          recentOrders: ordersData.orders || [],
        });
      } catch {
        setData({
          totalOrders: 0,
          totalUsers: 0,
          pendingReservations: 0,
          recentOrders: [],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Spinner />
      </div>
    );
  }

  const kpis = [
    { label: "Total Orders", value: data?.totalOrders ?? 0, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
    { label: "Active Users", value: data?.totalUsers ?? 0, icon: Users, color: "bg-info-500/10 text-info-500" },
    { label: "Pending Reservations", value: data?.pendingReservations ?? 0, icon: CalendarDays, color: "bg-warning-500/10 text-warning-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brown-900">Dashboard</h1>
          <p className="text-sm text-brown-500">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brown-900">Recent Orders</h2>
              <Link href="/admin/orders">
                <Button variant="secondary" size="sm">View All</Button>
              </Link>
            </div>
            {data?.recentOrders.length === 0 ? (
              <div className="py-10 text-center text-brown-500">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-200">
                      <th className="py-2 text-left text-xs font-medium text-brown-500">Order #</th>
                      <th className="py-2 text-left text-xs font-medium text-brown-500">Customer</th>
                      <th className="py-2 text-left text-xs font-medium text-brown-500">Items</th>
                      <th className="py-2 text-right text-xs font-medium text-brown-500">Total</th>
                      <th className="py-2 text-right text-xs font-medium text-brown-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentOrders.map((order) => {
                      const customerName = order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Guest";
                      const itemsSummary = order.items.map((i) => i.name).join(", ");
                      return (
                        <tr key={order._id} className="border-b border-cream-100 last:border-0">
                          <td className="py-3 font-medium text-brown-900">{order.orderNumber}</td>
                          <td className="py-3 text-brown-600">{customerName}</td>
                          <td className="max-w-[200px] truncate py-3 text-brown-600">{itemsSummary}</td>
                          <td className="py-3 text-right font-medium text-brown-900">${order.total.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <Badge variant={badgeVariant[order.status] as "new" | "preparing" | "ready" | "delivered" | "cancelled"}>
                              {order.status}
                            </Badge>
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

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-brown-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/orders" className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                  <Plus className="h-5 w-5 text-terracotta-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Orders</span>
              </Link>
              <Link href="/admin/menu" className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/10">
                  <UtensilsCrossed className="h-5 w-5 text-success-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Menu</span>
              </Link>
              <Link href="/admin/reservations" className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10">
                  <CalendarDays className="h-5 w-5 text-info-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Reservations</span>
              </Link>
              <Link href="/admin/payments" className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500/10">
                  <DollarSign className="h-5 w-5 text-warning-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Payments</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
