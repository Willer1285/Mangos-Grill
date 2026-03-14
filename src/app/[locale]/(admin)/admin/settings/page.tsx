"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, Button, Input, Switch } from "@/components/ui";
import {
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
  Search,
  Truck,
  CreditCard,
  Plus,
  Trash2,
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

/* ── Currency & Timezone lists ── */

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "\u20AC" },
  { code: "GBP", name: "British Pound", symbol: "\u00A3" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5" },
  { code: "CNY", name: "Chinese Yuan", symbol: "\u00A5" },
  { code: "KRW", name: "South Korean Won", symbol: "\u20A9" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
  { code: "COP", name: "Colombian Peso", symbol: "CO$" },
  { code: "CLP", name: "Chilean Peso", symbol: "CL$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "VES", name: "Venezuelan Bol\u00EDvar", symbol: "Bs." },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "NIO", name: "Nicaraguan C\u00F3rdoba", symbol: "C$" },
  { code: "CRC", name: "Costa Rican Col\u00F3n", symbol: "\u20A1" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/." },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U" },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs" },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "\u20B2" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "z\u0142" },
  { code: "CZK", name: "Czech Koruna", symbol: "K\u010D" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "TRY", name: "Turkish Lira", symbol: "\u20BA" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "\u20A6" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E\u00A3" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20B5" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR" },
  { code: "ILS", name: "Israeli Shekel", symbol: "\u20AA" },
  { code: "PHP", name: "Philippine Peso", symbol: "\u20B1" },
  { code: "THB", name: "Thai Baht", symbol: "\u0E3F" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "VND", name: "Vietnamese Dong", symbol: "\u20AB" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "RUB", name: "Russian Ruble", symbol: "\u20BD" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "\u20B4" },
];

const TIMEZONES_FALLBACK = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "America/Caracas", "America/Bogota",
  "America/Lima", "America/Santiago", "America/Argentina/Buenos_Aires", "America/Sao_Paulo",
  "America/Mexico_City", "America/Toronto", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Moscow",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland",
];

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [currencySearch, setCurrencySearch] = useState("");
  const [timezones, setTimezones] = useState(TIMEZONES_FALLBACK);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [reservationNotifications, setReservationNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [savingRegional, setSavingRegional] = useState(false);

  // Delivery options
  interface DeliveryOption {
    _id?: string;
    name: string;
    time: string;
    hasFee: boolean;
    price: number;
    enabled: boolean;
  }
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    { name: "Standard (Free)", time: "30-45 min", hasFee: false, price: 0, enabled: true },
    { name: "Express", time: "15-20 min", hasFee: true, price: 12.99, enabled: true },
  ]);
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Payment methods config
  interface PaymentMethodConfig {
    id: string;
    name: string;
    enabled: boolean;
  }
  const [paymentMethodsConfig, setPaymentMethodsConfig] = useState<PaymentMethodConfig[]>([
    { id: "credit_card", name: "Credit Card", enabled: true },
    { id: "zelle", name: "Zelle", enabled: true },
    { id: "binance", name: "Binance Pay", enabled: true },
  ]);
  const [savingPaymentMethods, setSavingPaymentMethods] = useState(false);

  // Brand settings
  const [brandName, setBrandName] = useState("Mango's Grill");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoDarkUrl, setLogoDarkUrl] = useState("");
  const [logoSize, setLogoSize] = useState(32);
  const [displayMode, setDisplayMode] = useState<"logo" | "text" | "both">("both");
  const [homepageReviewsCount, setHomepageReviewsCount] = useState(6);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  useEffect(() => {
    try {
      const allTz = Intl.supportedValuesOf("timeZone");
      if (allTz.length > 0) setTimezones(allTz);
    } catch { /* use fallback */ }
  }, []);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/site-config");
        if (res.ok) {
          const data = await res.json();
          setBrandName(data.brandName || "Mango's Grill");
          setHomepageReviewsCount(data.homepageReviewsCount || 6);
          setLogoUrl(data.logo || "");
          setLogoDarkUrl(data.logoDark || "");
          setLogoSize(data.logoSize ?? 32);
          setDisplayMode(data.displayMode || "both");
          setCurrency(data.currency || "USD");
          setTimezone(data.timezone || "America/New_York");
          if (data.deliveryOptions?.length) setDeliveryOptions(data.deliveryOptions);
          if (data.paymentMethods?.length) setPaymentMethodsConfig(data.paymentMethods);
        }
      } catch { /* empty */ }
    }
    loadConfig();
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, variant: "light" | "dark") {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUploading = variant === "light" ? setUploadingLogo : setUploadingLogoDark;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (variant === "light") setLogoUrl(data.url);
      else setLogoDarkUrl(data.url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveBrand() {
    setSavingBrand(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, logo: logoUrl, logoDark: logoDarkUrl, logoSize, displayMode, homepageReviewsCount }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Brand settings saved");
    } catch {
      toast.error("Failed to save brand settings");
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleSaveRegional() {
    setSavingRegional(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, timezone }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Regional settings saved");
    } catch {
      toast.error("Failed to save regional settings");
    } finally {
      setSavingRegional(false);
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

  async function handleSaveDeliveryOptions() {
    setSavingDelivery(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryOptions }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Delivery options saved");
    } catch {
      toast.error("Failed to save delivery options");
    } finally {
      setSavingDelivery(false);
    }
  }

  async function handleSavePaymentMethods() {
    setSavingPaymentMethods(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethods: paymentMethodsConfig }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Payment methods saved");
    } catch {
      toast.error("Failed to save payment methods");
    } finally {
      setSavingPaymentMethods(false);
    }
  }

  function addDeliveryOption() {
    setDeliveryOptions([...deliveryOptions, { name: "", time: "", hasFee: false, price: 0, enabled: true }]);
  }

  function removeDeliveryOption(index: number) {
    setDeliveryOptions(deliveryOptions.filter((_, i) => i !== index));
  }

  function updateDeliveryOption(index: number, field: keyof DeliveryOption, value: string | number | boolean) {
    setDeliveryOptions(deliveryOptions.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  }

  const filteredCurrencies = currencySearch
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.name.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : CURRENCIES;

  const filteredTimezones = timezoneSearch
    ? timezones.filter((tz) => tz.toLowerCase().includes(timezoneSearch.toLowerCase()))
    : timezones;

  const currentCurrency = CURRENCIES.find((c) => c.code === currency);

  const pricePreview = (() => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(29.99);
    } catch {
      return "$29.99";
    }
  })();

  const datePreview = (() => {
    try {
      return new Date().toLocaleString("en-US", {
        timeZone: timezone,
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return new Date().toLocaleString();
    }
  })();

  return (
    <div className="min-h-screen bg-cream-50 p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-900">Settings</h1>
          <p className="mt-1 text-brown-600">Manage your restaurant configuration</p>
        </div>
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
                  <p className="mb-2 text-xs text-brown-500">This name appears in the navbar, footer, and throughout the app</p>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Restaurant name" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Logo (Light Background)</label>
                  <p className="mb-2 text-xs text-brown-500">Used on pages with light/cream backgrounds (auth pages, etc.)</p>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-cream-300 bg-cream-50">
                        <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-cream-300 text-brown-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input id="logo-file" type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "light")} disabled={uploadingLogo} />
                      <Button variant="secondary" size="sm" onClick={() => document.getElementById("logo-file")?.click()} disabled={uploadingLogo}>
                        <Upload className="h-4 w-4" />
                        {uploadingLogo ? "Uploading..." : "Upload"}
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
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Logo (Dark Background)</label>
                  <p className="mb-2 text-xs text-brown-500">Used in navbar, footer, and admin sidebar. Falls back to light logo if not set.</p>
                  <div className="flex items-center gap-4">
                    {logoDarkUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-cream-300 bg-brown-800">
                        <Image src={logoDarkUrl} alt="Logo dark" fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-cream-300 bg-brown-800 text-cream-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input id="logo-dark-file" type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "dark")} disabled={uploadingLogoDark} />
                      <Button variant="secondary" size="sm" onClick={() => document.getElementById("logo-dark-file")?.click()} disabled={uploadingLogoDark}>
                        <Upload className="h-4 w-4" />
                        {uploadingLogoDark ? "Uploading..." : "Upload"}
                      </Button>
                      {logoDarkUrl && (
                        <Button variant="ghost" size="sm" onClick={() => setLogoDarkUrl("")} className="text-error-500">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Logo Size (px)</label>
                  <p className="mb-2 text-xs text-brown-500">Controls the width and height of the logo across the app (16-128px)</p>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={16}
                      max={128}
                      value={logoSize}
                      onChange={(e) => setLogoSize(Math.max(16, Math.min(128, Number(e.target.value))))}
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-brown-500">{logoSize}px</span>
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Homepage Reviews Count</label>
                  <p className="mb-2 text-xs text-brown-500">Number of reviews displayed on the homepage carousel (1-20)</p>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={homepageReviewsCount}
                    onChange={(e) => setHomepageReviewsCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="max-w-[120px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Preview</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-cream-200 bg-cream-50 px-4 py-3">
                      <span className="mr-2 text-xs text-brown-400">Light:</span>
                      {(displayMode === "logo" || displayMode === "both") && logoUrl && (
                        <div className="relative shrink-0" style={{ height: logoSize, width: logoSize }}>
                          <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                        </div>
                      )}
                      {(displayMode === "text" || displayMode === "both") && (
                        <span className="text-lg font-semibold text-brown-900">{brandName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-brown-700 bg-brown-800 px-4 py-3">
                      <span className="mr-2 text-xs text-cream-400">Dark:</span>
                      {(displayMode === "logo" || displayMode === "both") && (logoDarkUrl || logoUrl) && (
                        <div className="relative shrink-0" style={{ height: logoSize, width: logoSize }}>
                          <Image src={logoDarkUrl || logoUrl} alt="Logo" fill className="object-contain" />
                        </div>
                      )}
                      {(displayMode === "text" || displayMode === "both") && (
                        <span className="text-lg font-semibold text-cream-100">{brandName}</span>
                      )}
                    </div>
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
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Currency</label>
                  <p className="mb-2 text-xs text-brown-500">Used to format all prices across the application</p>
                  <div className="mb-2 flex items-center gap-2 rounded-md border border-cream-300 bg-white px-3">
                    <Search className="h-4 w-4 text-brown-400" />
                    <input
                      type="text"
                      placeholder="Search currencies..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="h-9 flex-1 bg-transparent text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none"
                    />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    size={6}
                    className="w-full rounded-md border border-cream-300 bg-white text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  >
                    {filteredCurrencies.map((c) => (
                      <option key={c.code} value={c.code} className="px-3 py-1.5">
                        {c.code} — {c.symbol} — {c.name}
                      </option>
                    ))}
                  </select>
                  {currentCurrency && (
                    <p className="mt-2 text-sm text-brown-700">
                      Selected: <strong>{currentCurrency.code}</strong> ({currentCurrency.symbol}) — Preview: <strong>{pricePreview}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">Timezone</label>
                  <p className="mb-2 text-xs text-brown-500">Used for dates, times, reservations, and order timestamps</p>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-2 h-4 w-4 shrink-0 text-brown-500" />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2 rounded-md border border-cream-300 bg-white px-3">
                        <Search className="h-4 w-4 text-brown-400" />
                        <input
                          type="text"
                          placeholder="Search timezones..."
                          value={timezoneSearch}
                          onChange={(e) => setTimezoneSearch(e.target.value)}
                          className="h-9 flex-1 bg-transparent text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none"
                        />
                      </div>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        size={6}
                        className="w-full rounded-md border border-cream-300 bg-white text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                      >
                        {filteredTimezones.map((tz) => (
                          <option key={tz} value={tz} className="px-3 py-1.5">
                            {tz.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-brown-700">
                    Current time: <strong>{datePreview}</strong>
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveRegional} loading={savingRegional}>
                    <Save className="h-4 w-4" />
                    Save Regional Settings
                  </Button>
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

        {/* Delivery Options */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-500/10">
                    <Truck className="h-5 w-5 text-terracotta-500" />
                  </div>
                  <h2 className="text-xl font-bold text-brown-900">Delivery Options</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={addDeliveryOption} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-4">
                {deliveryOptions.map((opt, i) => (
                  <div key={i} className="rounded-lg border border-cream-200 bg-cream-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-brown-500">Option {i + 1}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-brown-600">
                          Enabled
                          <Switch
                            checked={opt.enabled}
                            onCheckedChange={(val) => updateDeliveryOption(i, "enabled", val)}
                          />
                        </label>
                        {deliveryOptions.length > 1 && (
                          <button
                            onClick={() => removeDeliveryOption(i)}
                            className="rounded p-1 text-error-500 hover:bg-error-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-brown-700">Name</label>
                        <Input
                          value={opt.name}
                          onChange={(e) => updateDeliveryOption(i, "name", e.target.value)}
                          placeholder="e.g. Standard (Free)"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-brown-700">Time</label>
                        <Input
                          value={opt.time}
                          onChange={(e) => updateDeliveryOption(i, "time", e.target.value)}
                          placeholder="e.g. 30-45 min"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-brown-700">Charge Fee</label>
                        <div className="flex h-10 items-center gap-2">
                          <Switch
                            checked={opt.hasFee}
                            onCheckedChange={(val) => updateDeliveryOption(i, "hasFee", val)}
                          />
                          <span className="text-xs text-brown-500">{opt.hasFee ? "Paid" : "Free"}</span>
                        </div>
                      </div>
                      {opt.hasFee && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-brown-700">Price</label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={opt.price}
                            onChange={(e) => updateDeliveryOption(i, "price", Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveDeliveryOptions} loading={savingDelivery}>
                    <Save className="h-4 w-4" />
                    Save Delivery Options
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div variants={itemVariants}>
          <Card className="border border-cream-200">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-500/10">
                  <CreditCard className="h-5 w-5 text-success-500" />
                </div>
                <h2 className="text-xl font-bold text-brown-900">Payment Methods</h2>
              </div>
              <p className="mb-4 text-xs text-brown-500">Enable or disable payment methods available to customers during checkout.</p>
              <div className="space-y-3">
                {paymentMethodsConfig.map((pm, i) => (
                  <div key={pm.id} className="flex items-center justify-between rounded-lg border border-cream-200 p-4">
                    <div>
                      <p className="text-sm font-medium text-brown-900">{pm.name}</p>
                      <p className="text-xs text-brown-500">ID: {pm.id}</p>
                    </div>
                    <Switch
                      checked={pm.enabled}
                      onCheckedChange={(val) => {
                        setPaymentMethodsConfig(
                          paymentMethodsConfig.map((m, j) => (j === i ? { ...m, enabled: val } : m))
                        );
                      }}
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePaymentMethods} loading={savingPaymentMethods}>
                    <Save className="h-4 w-4" />
                    Save Payment Methods
                  </Button>
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
                    <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} disabled={importing} />
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
