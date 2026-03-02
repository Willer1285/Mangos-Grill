"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Input,
  Button,
  Switch,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
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

export default function ProfilePage() {
  const t = useTranslations("customer");

  /* ── Personal Information state ─────────────────────────── */
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (713) 555-1234",
    dob: "1990-06-15",
    gender: "male",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Password state ─────────────────────────────────────── */
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Notification preferences ───────────────────────────── */
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    reservationReminders: true,
    newsletter: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">
          {t("personalInfo")}
        </h1>
        <p className="mt-1 text-sm text-brown-600">
          Manage your personal details and preferences.
        </p>
      </div>

      {/* ── Personal Information ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-terracotta-500" />
                <h2 className="text-lg font-semibold text-brown-900">
                  {t("personalInfo")}
                </h2>
              </div>
              <Button
                variant={isEditing ? "primary" : "secondary"}
                size="sm"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </>
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
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={form.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                disabled={!isEditing}
              />
              <Select
                value={form.gender}
                onValueChange={(value) => handleChange("gender", value)}
                disabled={!isEditing}
              >
                <SelectTrigger label="Gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="nonbinary">Non-binary</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Change Password ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">
                {t("changePassword")}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label={t("currentPassword")}
                type="password"
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) =>
                  handlePasswordChange("current", e.target.value)
                }
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
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
              />
            </div>

            <div className="mt-5">
              <Button variant="primary" size="md">
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Notification Preferences ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-terracotta-500" />
              <h2 className="text-lg font-semibold text-brown-900">
                {t("notificationPreferences")}
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Order Updates
                  </p>
                  <p className="text-xs text-brown-600">
                    Receive notifications about your order status.
                  </p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={() => toggleNotification("orderUpdates")}
                />
              </div>

              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Promotions
                  </p>
                  <p className="text-xs text-brown-600">
                    Get notified about deals, discounts, and special offers.
                  </p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={() => toggleNotification("promotions")}
                />
              </div>

              <div className="flex items-center justify-between border-b border-cream-200 pb-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Reservation Reminders
                  </p>
                  <p className="text-xs text-brown-600">
                    Reminders before your upcoming reservations.
                  </p>
                </div>
                <Switch
                  checked={notifications.reservationReminders}
                  onCheckedChange={() =>
                    toggleNotification("reservationReminders")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brown-900">
                    Newsletter
                  </p>
                  <p className="text-xs text-brown-600">
                    Monthly newsletter with news and recipes.
                  </p>
                </div>
                <Switch
                  checked={notifications.newsletter}
                  onCheckedChange={() => toggleNotification("newsletter")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Delete Account ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border border-error-500/20">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-error-500" />
              <h2 className="text-lg font-semibold text-brown-900">
                {t("deleteAccount")}
              </h2>
            </div>

            <p className="text-sm text-brown-600">
              {t("deleteAccountDesc")}
            </p>
            <p className="mt-2 text-xs text-brown-600">
              This action is permanent and cannot be undone. All your data
              including order history, saved addresses, loyalty points, and
              preferences will be permanently removed.
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
