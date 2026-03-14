"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Skeleton } from "@/components/ui";
import {
  ClipboardList,
  Heart,
  CalendarDays,
  Star,
  ShoppingBag,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useBrand, formatPrice } from "@/lib/brand/brand-context";

interface DashboardData {
  stats: { totalOrders: number; reservations: number; favorites: number; loyaltyPoints: number };
  recentOrders: { id: string; date: string; items: string; total: number; status: string }[];
  upcomingReservation: {
    date: string;
    time: string;
    location: string;
    guests: number;
    status: string;
  } | null;
}

const statConfig = [
  { key: "totalOrders" as const, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
  { key: "favorites" as const, icon: Heart, color: "bg-error-500/10 text-error-500" },
  { key: "reservations" as const, icon: CalendarDays, color: "bg-info-500/10 text-info-500" },
  { key: "loyaltyPoints" as const, icon: Star, color: "bg-gold-500/10 text-gold-500" },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Delivered": case "Completed": return "delivered" as const;
    case "Cancelled": return "cancelled" as const;
    case "New": case "Preparing": return "active" as const;
    default: return "default" as const;
  }
}

export default function CustomerDashboardPage() {
  const t = useTranslations("customer");
  const { currency } = useBrand();
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/account/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchDashboard();
  }, []);

  const firstName = session?.user?.firstName || session?.user?.name?.split(" ")[0] || "";

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats || { totalOrders: 0, reservations: 0, favorites: 0, loyaltyPoints: 0 };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">
          {t("welcome", { name: firstName })}
        </h1>
        <p className="mt-1 text-sm text-brown-600">{t("accountDesc")}</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brown-900">
                    {stats[stat.key].toLocaleString()}
                  </p>
                  <p className="text-xs text-brown-500">{t(stat.key)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brown-900">{t("recentOrders")}</h2>
            <Link href="/account/orders" className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
              View All
            </Link>
          </div>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200">
                    <th className="py-2 text-left text-xs font-medium text-brown-500">Order #</th>
                    <th className="py-2 text-left text-xs font-medium text-brown-500">Date</th>
                    <th className="py-2 text-left text-xs font-medium text-brown-500">Items</th>
                    <th className="py-2 text-right text-xs font-medium text-brown-500">Total</th>
                    <th className="py-2 text-right text-xs font-medium text-brown-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-cream-100 last:border-0">
                      <td className="py-3 font-medium text-brown-900">{order.id}</td>
                      <td className="py-3 text-brown-600">
                        {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="max-w-[200px] truncate py-3 text-brown-600">{order.items}</td>
                      <td className="py-3 text-right font-medium text-brown-900">{formatPrice(order.total, currency)}</td>
                      <td className="py-3 text-right">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-cream-400" />
              <p className="text-sm text-brown-500">{t("noOrders") || "No orders yet"}</p>
              <Link href="/menu" className="mt-2 inline-block text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
                {t("browseMenu") || "Browse our menu"}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reservation */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-brown-900">{t("upcomingReservation")}</h2>
            {data?.upcomingReservation ? (
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-terracotta-500/10">
                  <span className="text-xs font-medium text-terracotta-500">
                    {new Date(data.upcomingReservation.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </span>
                  <span className="text-2xl font-bold text-terracotta-500">
                    {new Date(data.upcomingReservation.date).getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brown-900">
                      {new Date(data.upcomingReservation.date).toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                    <Badge variant="confirmed">{data.upcomingReservation.status}</Badge>
                  </div>
                  <div className="mt-1 space-y-0.5 text-xs text-brown-600">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {data.upcomingReservation.time}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {data.upcomingReservation.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {data.upcomingReservation.guests} guests
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <CalendarDays className="mx-auto mb-2 h-10 w-10 text-cream-400" />
                <p className="text-sm text-brown-500">{t("noReservations") || "No upcoming reservations"}</p>
                <Link href="/reservations" className="mt-2 inline-block text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
                  {t("makeReservation") || "Make a reservation"}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-brown-900">{t("quickLinks") || "Quick Links"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/menu"
                className="flex items-center gap-2 rounded-lg border border-cream-200 p-3 text-sm font-medium text-brown-900 transition-colors hover:bg-cream-100"
              >
                <ShoppingBag className="h-4 w-4 text-terracotta-500" />
                {t("browseMenu") || "Browse Menu"}
              </Link>
              <Link
                href="/reservations"
                className="flex items-center gap-2 rounded-lg border border-cream-200 p-3 text-sm font-medium text-brown-900 transition-colors hover:bg-cream-100"
              >
                <CalendarDays className="h-4 w-4 text-terracotta-500" />
                {t("bookTable") || "Book a Table"}
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-2 rounded-lg border border-cream-200 p-3 text-sm font-medium text-brown-900 transition-colors hover:bg-cream-100"
              >
                <ClipboardList className="h-4 w-4 text-terracotta-500" />
                {t("orderHistory") || "Order History"}
              </Link>
              <Link
                href="/account/profile"
                className="flex items-center gap-2 rounded-lg border border-cream-200 p-3 text-sm font-medium text-brown-900 transition-colors hover:bg-cream-100"
              >
                <Star className="h-4 w-4 text-terracotta-500" />
                {t("myProfile") || "My Profile"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
