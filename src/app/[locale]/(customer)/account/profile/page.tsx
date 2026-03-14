"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Input,
  Button,
  Switch,
  Skeleton,
} from "@/components/ui";
import {
  User,
  Lock,
  Bell,
  Trash2,
  Pencil,
  Save,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("customer");

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/account/profile");
        if (res.ok) {
          const data = await res.json();
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  /* Password state */
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  /* Notification preferences */
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    reservationReminders: true,
    newsletter: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">{t("personalInfo")}</h1>
        <p className="mt-1 text-sm text-brown-600">Manage your personal details and preferences.</p>
      </div>

      {/* Personal Information */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-terracotta-500" />
                <h2 className="text-lg font-semibold text-brown-900">{t("personalInfo")}</h2>
              </div>
              <Button
                variant={isEditing ? "primary" : "secondary"}
                size="sm"
                loading={saving}
                onClick={() => {
                  if (isEditing) handleSave();
                  else setIsEditing(true);
                }}
              >
                {isEditing ? (
                  <><Save className="h-4 w-4" /> Save</>
                ) : (
                  <><Pencil className="h-4 w-4" /> Edit</>
                )}
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                disabled
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">{t("changePassword")}</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label={t("currentPassword")}
                type="password"
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) => handlePasswordChange("current", e.target.value)}
              />
              <Input
                label={t("newPassword")}
                type="password"
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
              />
              <Input
                label={t("confirmPassword")}
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
              />
            </div>

            <div className="mt-5">
              <Button variant="primary" size="md">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">{t("notificationPreferences")}</h2>
            </div>

            <div className="space-y-5">
              {[
                { key: "orderUpdates" as const, title: "Order Updates", desc: "Receive notifications about your order status." },
                { key: "promotions" as const, title: "Promotions", desc: "Get notified about deals, discounts, and special offers." },
                { key: "reservationReminders" as const, title: "Reservation Reminders", desc: "Reminders before your upcoming reservations." },
                { key: "newsletter" as const, title: "Newsletter", desc: "Monthly newsletter with news and recipes." },
              ].map((item, i, arr) => (
                <div key={item.key} className={`flex items-center justify-between ${i < arr.length - 1 ? "border-b border-cream-200 pb-4" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-brown-900">{item.title}</p>
                    <p className="text-xs text-brown-600">{item.desc}</p>
                  </div>
                  <Switch checked={notifications[item.key]} onCheckedChange={() => toggleNotification(item.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Card className="border border-error-500/20">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error-500" />
              <h2 className="text-lg font-semibold text-brown-900">{t("deleteAccount")}</h2>
            </div>
            <p className="text-sm text-brown-600">{t("deleteAccountDesc")}</p>
            <p className="mt-2 text-xs text-brown-600">
              This action is permanent and cannot be undone. All your data including order history, saved addresses, and preferences will be permanently removed.
            </p>
            <div className="mt-5">
              <Button variant="destructive" size="md">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
