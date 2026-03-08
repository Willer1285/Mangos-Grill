"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, Button, Input, Switch } from "@/components/ui";
import {
  Settings,
  Globe,
  Bell,
  Clock,
  DollarSign,
  Save,
  Database,
  Download,
  Upload,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
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
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Brand settings
  const [brandName, setBrandName] = useState("Mango's Grill");
  const [logoUrl, setLogoUrl] = useState("");
  const [displayMode, setDisplayMode] = useState<"logo" | "text" | "both">("both");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  useEffect(() => {
    async function loadBrandConfig() {
      try {
        const res = await fetch("/api/admin/site-config");
        if (res.ok) {
          const data = await res.json();
          setBrandName(data.brandName || "Mango's Grill");
          setLogoUrl(data.logo || "");
          setDisplayMode(data.displayMode || "both");
        }
      } catch { /* empty */ }
    }
    loadBrandConfig();
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setLogoUrl(data.url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  }

  async function handleSaveBrand() {
    setSavingBrand(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, logo: logoUrl, displayMode }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Brand settings saved");
    } catch {
      toast.error("Failed to save brand settings");
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/settings/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mangos-grill-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported successfully");
    } catch {
      toast.error("Failed to export backup");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("This will replace ALL existing data with the backup. Are you sure?")) {
      e.target.value = "";
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const res = await fetch("/api/admin/settings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Import failed");
      }
      toast.success("Backup restored successfully");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import backup");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  async function handleReset() {
    if (resetConfirmation !== "RESET") {
      toast.error("Type RESET to confirm");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESET" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Reset failed");
      }
      toast.success("Database reset successfully");
      setResetConfirmation("");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset database");
    } finally {
      setResetting(false);
    }
  }

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
        {/* Brand Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                  <ImageIcon className="h-5 w-5 text-terracotta-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Brand</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Brand Name</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Restaurant name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Logo</label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-cream-300">
                        <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-cream-300 text-brown-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input id="logo-file" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                      <Button variant="secondary" size="sm" onClick={() => document.getElementById("logo-file")?.click()} disabled={uploadingLogo}>
                        <Upload className="h-4 w-4" />
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      </Button>
                      {logoUrl && (
                        <Button variant="ghost" size="sm" onClick={() => setLogoUrl("")} className="text-error-500">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Display Mode</label>
                  <p className="mb-2 text-xs text-brown-500">Choose how the brand is displayed in the navbar and footer</p>
                  <div className="flex gap-2">
                    {(["logo", "text", "both"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDisplayMode(mode)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                          displayMode === mode
                            ? "border-terracotta-500 bg-terracotta-500 text-white"
                            : "border-cream-300 bg-white text-brown-700 hover:border-terracotta-300"
                        }`}
                      >
                        {mode === "both" ? "Logo + Text" : mode === "logo" ? "Logo Only" : "Text Only"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Preview */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Preview</label>
                  <div className="flex items-center gap-2 rounded-lg border border-cream-200 bg-cream-50 px-4 py-3">
                    {(displayMode === "logo" || displayMode === "both") && logoUrl && (
                      <div className="relative h-8 w-8 shrink-0">
                        <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                      </div>
                    )}
                    {(displayMode === "text" || displayMode === "both") && (
                      <span className="text-lg font-semibold text-brown-900">{brandName}</span>
                    )}
                    {displayMode === "logo" && !logoUrl && (
                      <span className="text-sm text-brown-400">Upload a logo to preview</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveBrand} loading={savingBrand}>
                    <Save className="h-4 w-4" />
                    Save Brand Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
        {/* Backup & Restore */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10">
                  <Database className="h-5 w-5 text-info-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Backup & Restore</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Export backup</p>
                    <p className="text-xs text-brown-600">Download a full backup of all application data</p>
                  </div>
                  <Button variant="secondary" onClick={handleExport} loading={exporting}>
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brown-900">Import backup</p>
                    <p className="text-xs text-brown-600">Restore data from a previously exported backup file</p>
                  </div>
                  <div>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                      disabled={importing}
                    />
                    <Button variant="secondary" onClick={() => document.getElementById("import-file")?.click()} disabled={importing}>
                      <Upload className="h-4 w-4" />
                      {importing ? "Importing..." : "Import"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card className="border border-error-500/30">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-500/10">
                  <AlertTriangle className="h-5 w-5 text-error-500" />
                </div>
                <h2 className="text-xl font-bold text-error-600">Danger Zone</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-brown-900">Reset database</p>
                  <p className="text-xs text-brown-600">
                    Permanently delete all data (orders, products, users, etc.). Only your admin account will be preserved.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder='Type "RESET" to confirm'
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    className="max-w-[240px]"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleReset}
                    loading={resetting}
                    disabled={resetConfirmation !== "RESET"}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Reset Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
