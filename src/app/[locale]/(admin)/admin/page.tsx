"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  TrendingUp,
  XCircle,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";

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
  totalSales: number;
  dishesSold: number;
  deliveredOrders: number;
  cancelledOrders: number;
  confirmedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  totalUsers: number;
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
  const t = useTranslations("admin");
  const { currency } = useBrand();
  const tc = useTranslations("common");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = session?.user?.role === "SuperAdmin";

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        /* empty */
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
    { label: t("orders"), value: data?.totalOrders ?? 0, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
    { label: t("sales"), value: formatPrice(data?.totalSales ?? 0, currency), icon: DollarSign, color: "bg-success-500/10 text-success-500" },
    { label: t("dishesSold"), value: data?.dishesSold ?? 0, icon: Package, color: "bg-info-500/10 text-info-500" },
    { label: t("delivered"), value: data?.deliveredOrders ?? 0, icon: TrendingUp, color: "bg-success-500/10 text-success-500" },
    { label: t("cancelled"), value: data?.cancelledOrders ?? 0, icon: XCircle, color: "bg-error-500/10 text-error-500" },
    { label: t("reservConfirmed"), value: data?.confirmedReservations ?? 0, icon: CheckCircle2, color: "bg-success-500/10 text-success-500" },
    { label: t("reservCancelled"), value: data?.cancelledReservations ?? 0, icon: XCircle, color: "bg-error-500/10 text-error-500" },
    { label: t("reservPending"), value: data?.pendingReservations ?? 0, icon: CalendarDays, color: "bg-warning-500/10 text-warning-500" },
    ...(isSuperAdmin
      ? [{ label: t("users"), value: data?.totalUsers ?? 0, icon: Users, color: "bg-info-500/10 text-info-500" }]
      : []),
  ];

  const managerQuickActions = [
    { href: "/admin/orders", label: t("orders"), icon: Plus, iconBg: "bg-terracotta-500/10", iconColor: "text-terracotta-500" },
    { href: "/admin/reservations", label: tc("viewAll"), icon: CalendarDays, iconBg: "bg-info-500/10", iconColor: "text-info-500" },
  ];

  const superAdminQuickActions = [
    { href: "/admin/orders", label: t("orders"), icon: Plus, iconBg: "bg-terracotta-500/10", iconColor: "text-terracotta-500" },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed, iconBg: "bg-success-500/10", iconColor: "text-success-500" },
    { href: "/admin/reservations", label: tc("viewAll"), icon: CalendarDays, iconBg: "bg-info-500/10", iconColor: "text-info-500" },
    { href: "/admin/payments", label: t("payments"), icon: DollarSign, iconBg: "bg-warning-500/10", iconColor: "text-warning-500" },
  ];

  const quickActions = isSuperAdmin ? superAdminQuickActions : managerQuickActions;

  const namePrefix = session?.user?.firstName ? `, ${session.user.firstName}` : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brown-900">{t("dashboard")}</h1>
          <p className="text-sm text-brown-500">
            {t("welcomeBack", { name: namePrefix })}
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
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xl font-bold text-brown-900">{kpi.value}</p>
                <p className="text-[11px] text-brown-500">{kpi.label}</p>
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
              <h2 className="text-lg font-semibold text-brown-900">{t("recentOrders")}</h2>
              <Link href="/admin/orders">
                <Button variant="secondary" size="sm">{tc("viewAll")}</Button>
              </Link>
            </div>
            {data?.recentOrders.length === 0 ? (
              <div className="py-10 text-center text-brown-500">{t("noOrdersYet")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cream-200">
                      <th className="py-2 text-left text-xs font-medium text-brown-500">{t("orderNumber")}</th>
                      <th className="py-2 text-left text-xs font-medium text-brown-500">{t("customer")}</th>
                      <th className="py-2 text-left text-xs font-medium text-brown-500">{t("items")}</th>
                      <th className="py-2 text-right text-xs font-medium text-brown-500">{tc("total")}</th>
                      <th className="py-2 text-right text-xs font-medium text-brown-500">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentOrders.map((order) => {
                      const customerName = order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : tc("guest");
                      const itemsSummary = order.items.map((i) => i.name).join(", ");
                      return (
                        <tr key={order._id} className="border-b border-cream-100 last:border-0">
                          <td className="py-3 font-medium text-brown-900">{order.orderNumber}</td>
                          <td className="py-3 text-brown-600">{customerName}</td>
                          <td className="max-w-[200px] truncate py-3 text-brown-600">{itemsSummary}</td>
                          <td className="py-3 text-right font-medium text-brown-900">{formatPrice(order.total, currency)}</td>
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
            <h2 className="mb-4 text-lg font-semibold text-brown-900">{t("quickActions")}</h2>
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
