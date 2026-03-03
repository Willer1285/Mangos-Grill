"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button, Spinner } from "@/components/ui";
import {
  ClipboardList,
  DollarSign,
  Users,
  CalendarDays,
  Plus,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Order {
  _id: string;
  orderNumber: string;
  customer?: { firstName: string; lastName: string };
  items: { name: string }[];
  total: number;
  status: string;
  location?: string;
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
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = session?.user?.role === "SuperAdmin";

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const fetches: Promise<Response>[] = [
          fetch("/api/admin/orders?limit=5"),
          fetch("/api/admin/reservations?status=Pending"),
        ];

        // Only fetch users for SuperAdmin
        if (isSuperAdmin) {
          fetches.push(fetch("/api/admin/users?limit=1"));
        }

        const results = await Promise.all(fetches);

        const ordersData = results[0].ok ? await results[0].json() : { orders: [], total: 0 };
        const reservationsData = results[1].ok ? await results[1].json() : [];
        const usersData = isSuperAdmin && results[2]?.ok ? await results[2].json() : { total: 0 };

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
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Spinner />
      </div>
    );
  }

  const kpis = [
    { label: "Total Orders", value: data?.totalOrders ?? 0, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
    ...(isSuperAdmin
      ? [{ label: "Active Users", value: data?.totalUsers ?? 0, icon: Users, color: "bg-info-500/10 text-info-500" }]
      : []),
    { label: "Pending Reservations", value: data?.pendingReservations ?? 0, icon: CalendarDays, color: "bg-warning-500/10 text-warning-500" },
  ];

  // Manager quick actions - only orders and reservations
  const managerQuickActions = [
    { href: "/admin/orders", label: "Orders", icon: Plus, iconBg: "bg-terracotta-500/10", iconColor: "text-terracotta-500" },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays, iconBg: "bg-info-500/10", iconColor: "text-info-500" },
  ];

  // SuperAdmin quick actions - all
  const superAdminQuickActions = [
    { href: "/admin/orders", label: "Orders", icon: Plus, iconBg: "bg-terracotta-500/10", iconColor: "text-terracotta-500" },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, iconBg: "bg-success-500/10", iconColor: "text-success-500" },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays, iconBg: "bg-info-500/10", iconColor: "text-info-500" },
    { href: "/admin/payments", label: "Payments", icon: DollarSign, iconBg: "bg-warning-500/10", iconColor: "text-warning-500" },
  ];

  const quickActions = isSuperAdmin ? superAdminQuickActions : managerQuickActions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brown-900">Dashboard</h1>
          <p className="text-sm text-brown-500">
            Welcome back{session?.user?.firstName ? `, ${session.user.firstName}` : ""}. Here&apos;s what&apos;s happening today.
          </p>
          {!isSuperAdmin && session?.user?.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-terracotta-500">
              <MapPin className="h-3.5 w-3.5" />
              {session.user.location}
            </p>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-4 sm:grid-cols-2 ${isSuperAdmin ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
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
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.iconBg}`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium text-brown-700">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
