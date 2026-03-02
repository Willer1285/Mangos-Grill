"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input, Switch } from "@/components/ui";
import {
  Settings,
  Globe,
  Bell,
  Clock,
  DollarSign,
  Save,
} from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState("Mango's Grill");
  const [email, setEmail] = useState("info@mangosgrill.com");
  const [phone, setPhone] = useState("+1 (305) 555-0123");
  const [address, setAddress] = useState("123 Calle Principal, Miami, FL");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [reservationNotifications, setReservationNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-900">Settings</h1>
          <p className="mt-1 text-brown-600">Manage your restaurant configuration</p>
        </div>
        <Button>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* General Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                  <Settings className="h-5 w-5 text-terracotta-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">General</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Restaurant Name
                  </label>
                  <Input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Phone
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10">
                  <Globe className="h-5 w-5 text-info-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Regional</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-10 w-full rounded-md border border-cream-300 bg-white px-3 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VES">VES (Bs.)</option>
                    <option value="EUR">EUR (&euro;)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">
                    Timezone
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brown-500" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-10 flex-1 rounded-md border border-cream-300 bg-white px-3 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Caracas">Venezuela (VET)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-500/10">
                  <Bell className="h-5 w-5 text-warning-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Order notifications</p>
                    <p className="text-xs text-brown-600">Receive alerts for new orders</p>
                  </div>
                  <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Reservation notifications</p>
                    <p className="text-xs text-brown-600">Receive alerts for new reservations</p>
                  </div>
                  <Switch checked={reservationNotifications} onCheckedChange={setReservationNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Email digest</p>
                    <p className="text-xs text-brown-600">Daily summary of activity via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/10">
                  <DollarSign className="h-5 w-5 text-success-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Orders & Payments</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Auto-confirm orders</p>
                    <p className="text-xs text-brown-600">Automatically confirm orders without manual review</p>
                  </div>
                  <Switch checked={autoConfirmOrders} onCheckedChange={setAutoConfirmOrders} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
