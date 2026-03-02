"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, Switch, Button } from "@/components/ui";
import { Globe, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("customer");

  /* ── Language & Region state ──────────────────────────── */
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [currency, setCurrency] = useState("USD");

  /* ── App Preferences state ────────────────────────────── */
  const [preferences, setPreferences] = useState({
    darkMode: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectClasses =
    "w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500";

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">Settings</h1>
        <p className="mt-1 text-sm text-brown-600">
          Manage your language, region, and app preferences.
        </p>
      </div>

      {/* ── Language & Region ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">
                Language &amp; Region
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Language */}
              <div>
                <label className="mb-1 block text-sm font-medium text-brown-700">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={selectClasses}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-brown-700">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={selectClasses}
                >
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-1 block text-sm font-medium text-brown-700">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={selectClasses}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (&euro;)</option>
                  <option value="GBP">GBP (&pound;)</option>
                  <option value="VES">VES (Bs.)</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <Button variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── App Preferences ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">
                App Preferences
              </h2>
            </div>

            <div className="space-y-5">
              {/* Dark Mode */}
              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Dark Mode
                  </p>
                  <p className="text-xs text-brown-600">
                    Switch to a darker color theme for low-light environments.
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={() => togglePreference("darkMode")}
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Push Notifications
                  </p>
                  <p className="text-xs text-brown-600">
                    Receive push notifications on your device.
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={() => togglePreference("pushNotifications")}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Email Notifications
                  </p>
                  <p className="text-xs text-brown-600">
                    Receive order updates and promotions via email.
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={() => togglePreference("emailNotifications")}
                />
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    SMS Notifications
                  </p>
                  <p className="text-xs text-brown-600">
                    Receive text messages for order and reservation updates.
                  </p>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={() => togglePreference("smsNotifications")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
