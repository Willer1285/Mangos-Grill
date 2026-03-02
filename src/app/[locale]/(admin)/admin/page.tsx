"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import {
  ClipboardList,
  DollarSign,
  Users,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  FileDown,
} from "lucide-react";

/* ── Mock data ── */
const kpis = [
  { label: "Total Orders", value: "1,245", change: "+12.5%", up: true, icon: ClipboardList, color: "bg-terracotta-500/10 text-terracotta-500" },
  { label: "Revenue", value: "$32,580", change: "+8.2%", up: true, icon: DollarSign, color: "bg-success-500/10 text-success-500" },
  { label: "Active Users", value: "584", change: "+3.1%", up: true, icon: Users, color: "bg-info-500/10 text-info-500" },
  { label: "Pending Reservations", value: "18", change: "-2.4%", up: false, icon: CalendarDays, color: "bg-warning-500/10 text-warning-500" },
] as const;

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const revenueThisMonth = [4200, 3800, 4600, 5100, 6200, 7800, 5400];
const revenueLastMonth = [3800, 3500, 4200, 4800, 5800, 7200, 5000];

const recentOrders = [
  { id: "MG-A1B2C3", customer: "John Doe", items: "Arepa Reina, Pabellon", total: 28.5, status: "New", date: "5 min ago" },
  { id: "MG-D4E5F6", customer: "Ana Lopez", items: "Tequeños, Cachapa", total: 22.0, status: "Preparing", date: "15 min ago" },
  { id: "MG-G7H8I9", customer: "Carlos R.", items: "Asado Negro, Tres Leches", total: 34.75, status: "Ready", date: "28 min ago" },
  { id: "MG-J1K2L3", customer: "Maria G.", items: "Empanadas (4), Jugo", total: 18.5, status: "Delivered", date: "1 hr ago" },
  { id: "MG-M4N5O6", customer: "Luis P.", items: "Pabellon Bowl", total: 16.99, status: "Cancelled", date: "2 hrs ago" },
] as const;

export default function AdminDashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<"this" | "last">("this");
  const chartData = chartPeriod === "this" ? revenueThisMonth : revenueLastMonth;
  const maxRevenue = Math.max(...chartData);

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
                  <span className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-success-500" : "text-error-500"}`}>
                    {kpi.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {kpi.change}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-brown-900">{kpi.value}</p>
                <p className="text-xs text-brown-500">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brown-900">Revenue Overview</h2>
              <div className="flex gap-1 rounded-lg bg-cream-200 p-1">
                <button
                  onClick={() => setChartPeriod("this")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    chartPeriod === "this" ? "bg-white text-brown-900 shadow-sm" : "text-brown-500"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setChartPeriod("last")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    chartPeriod === "last" ? "bg-white text-brown-900 shadow-sm" : "text-brown-500"
                  }`}
                >
                  Last Month
                </button>
              </div>
            </div>
            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3" style={{ height: 200 }}>
              {chartData.map((value, i) => (
                <div key={weekDays[i]} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="w-full rounded-t-md bg-terracotta-500"
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-xs text-brown-500">{weekDays[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-brown-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                  <Plus className="h-5 w-5 text-terracotta-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">New Order</span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/10">
                  <UtensilsCrossed className="h-5 w-5 text-success-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Add Menu Item</span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10">
                  <CalendarDays className="h-5 w-5 text-info-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">New Reservation</span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-lg border border-cream-200 p-4 transition-colors hover:bg-cream-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500/10">
                  <FileDown className="h-5 w-5 text-warning-500" />
                </div>
                <span className="text-xs font-medium text-brown-700">Export Report</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brown-900">Recent Orders</h2>
            <Button variant="secondary" size="sm">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="py-2 text-left text-xs font-medium text-brown-500">Order #</th>
                  <th className="py-2 text-left text-xs font-medium text-brown-500">Customer</th>
                  <th className="py-2 text-left text-xs font-medium text-brown-500">Items</th>
                  <th className="py-2 text-right text-xs font-medium text-brown-500">Total</th>
                  <th className="py-2 text-right text-xs font-medium text-brown-500">Status</th>
                  <th className="py-2 text-right text-xs font-medium text-brown-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-cream-100 last:border-0">
                    <td className="py-3 font-medium text-brown-900">{order.id}</td>
                    <td className="py-3 text-brown-600">{order.customer}</td>
                    <td className="max-w-[200px] truncate py-3 text-brown-600">{order.items}</td>
                    <td className="py-3 text-right font-medium text-brown-900">${order.total.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={order.status.toLowerCase() as "new" | "preparing" | "ready" | "delivered" | "cancelled"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-xs text-brown-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
