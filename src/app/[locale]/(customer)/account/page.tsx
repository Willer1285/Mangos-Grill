"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
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

/* Mock data — will be fetched from API in production */
const stats = [
  { key: "totalOrders", value: 24, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
  { key: "favorites", value: 8, icon: Heart, color: "bg-error-500/10 text-error-500" },
  { key: "reservations", value: 5, icon: CalendarDays, color: "bg-info-500/10 text-info-500" },
  { key: "loyaltyPoints", value: 1250, icon: Star, color: "bg-gold-500/10 text-gold-500" },
] as const;

const recentOrders = [
  { id: "MG-A1B2C3", date: "Feb 28, 2026", items: "Arepa Reina Pepiada, Pabellon Bowl", total: 28.5, status: "Delivered" },
  { id: "MG-D4E5F6", date: "Feb 25, 2026", items: "Tequeños (6pc), Cachapa con Queso", total: 22.0, status: "Delivered" },
  { id: "MG-G7H8I9", date: "Feb 20, 2026", items: "Asado Negro, Tres Leches", total: 34.75, status: "Cancelled" },
] as const;

const upcomingReservation = {
  date: "Mar 5",
  day: "Thursday",
  time: "7:30 PM",
  location: "Houston - Montrose",
  guests: 4,
  status: "Confirmed",
};

const favoriteDishes = [
  { name: "Arepa Reina Pepiada", price: 12.99, image: null },
  { name: "Pabellon Criollo", price: 16.99, image: null },
  { name: "Tequeños (6pc)", price: 9.99, image: null },
] as const;

export default function CustomerDashboardPage() {
  const t = useTranslations("customer");

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">
          {t("welcome", { name: "John" })}
        </h1>
        <p className="mt-1 text-sm text-brown-600">{t("accountDesc")}</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
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
                    {stat.value.toLocaleString()}
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-100 last:border-0">
                    <td className="py-3 font-medium text-brown-900">{order.id}</td>
                    <td className="py-3 text-brown-600">{order.date}</td>
                    <td className="max-w-[200px] truncate py-3 text-brown-600">{order.items}</td>
                    <td className="py-3 text-right font-medium text-brown-900">${order.total.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={order.status === "Delivered" ? "delivered" : "cancelled"}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reservation */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-brown-900">{t("upcomingReservation")}</h2>
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-terracotta-500/10">
                <span className="text-xs font-medium text-terracotta-500">MAR</span>
                <span className="text-2xl font-bold text-terracotta-500">5</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-brown-900">{upcomingReservation.day}</p>
                  <Badge variant="confirmed">{upcomingReservation.status}</Badge>
                </div>
                <div className="mt-1 space-y-0.5 text-xs text-brown-600">
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {upcomingReservation.time}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {upcomingReservation.location}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {upcomingReservation.guests} guests
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm">{t("modify")}</Button>
                  <Button variant="destructive" size="sm">Cancel</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Dishes */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brown-900">{t("favoriteDishes")}</h2>
              <Link href="/account/favorites" className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {favoriteDishes.map((dish) => (
                <div key={dish.name} className="flex items-center gap-3 rounded-lg border border-cream-200 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-cream-200">
                    <ShoppingBag className="h-5 w-5 text-cream-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brown-900">{dish.name}</p>
                    <p className="text-xs font-medium text-terracotta-500">${dish.price}</p>
                  </div>
                  <Button variant="secondary" size="sm">{t("reorder")}</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
