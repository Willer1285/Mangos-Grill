"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageCircle,
  Navigation,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface LocationData {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  image?: string;
  hours?: BusinessHours[];
  isFlagship?: boolean;
  mapCoordinates?: { lat: number; lng: number };
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const [sending, setSending] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data: LocationData[]) => {
        setLocations(data);
        // Auto-select flagship or first location
        const flagship = data.find((l) => l.isFlagship);
        if (flagship) setSelectedLocationId(flagship._id);
        else if (data.length > 0) setSelectedLocationId(data[0]._id);
      })
      .catch(() => {});
  }, []);

  const selectedLocation = locations.find((l) => l._id === selectedLocationId) || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          locationId: selectedLocationId,
        }),
      });
      if (res.ok) {
        toast.success(t("messageSent"));
        setFormData({ email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(t("messageFailed"));
      }
    } catch {
      toast.error(t("messageFailed"));
    } finally {
      setSending(false);
    }
  }

  function getDirectionsUrl(loc: LocationData) {
    if (loc.mapCoordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${loc.mapCoordinates.lat},${loc.mapCoordinates.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`;
  }

  return (
    <>
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">{t("subtitle")}</p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{t("title")}</h1>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-semibold text-brown-900">{t("sendUsMessage")}</h2>
            <p className="mt-2 text-sm text-brown-600">{t("formDesc")}</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {/* Location selector for the form */}
              {locations.length > 1 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brown-700">{t("selectLocation")}</label>
                  <div className="relative">
                    <select
                      value={selectedLocationId || ""}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="h-10 w-full appearance-none rounded-md border border-cream-300 bg-white px-3 pr-10 text-sm text-brown-900 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name} — {loc.city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
                  </div>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t("email")}
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />
                <Input
                  label={t("phone")}
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <Input
                label={t("subject")}
                type="text"
                placeholder={t("subjectPlaceholder")}
                value={formData.subject}
                onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                required
              />
              <Textarea
                label={t("message")}
                placeholder={t("messagePlaceholder")}
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                required
              />
              <Button variant="primary" size="lg" className="w-full sm:w-auto" loading={sending}>
                <Send className="h-4 w-4" />
                {t("sendMessage")}
              </Button>
            </form>
          </motion.div>

          {/* Locations list */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="space-y-4">
            <h2 className="text-2xl font-semibold text-brown-900">{t("ourLocations")}</h2>
            <p className="text-sm text-brown-600">{t("locationsDesc")}</p>

            <div className="mt-4 space-y-3">
              {locations.map((loc) => {
                const isSelected = loc._id === selectedLocationId;
                return (
                  <button
                    key={loc._id}
                    type="button"
                    onClick={() => setSelectedLocationId(loc._id)}
                    className={`w-full text-left transition-all ${
                      isSelected
                        ? "ring-2 ring-terracotta-500 ring-offset-2"
                        : "hover:shadow-md"
                    } rounded-xl`}
                  >
                    <Card className="overflow-hidden border border-cream-200">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-terracotta-500 text-white" : "bg-terracotta-500/10 text-terracotta-500"}`}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-brown-900">{loc.name}</h3>
                              {loc.isFlagship && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-terracotta-500/10 px-2 py-0.5 text-[10px] font-semibold text-terracotta-600">
                                  <Star className="h-2.5 w-2.5" /> Flagship
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-brown-600">{loc.address}</p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brown-500">
                              {loc.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${loc.phone}`} className="hover:text-terracotta-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {loc.phone}
                                  </a>
                                </span>
                              )}
                              {loc.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <a href={`mailto:${loc.email}`} className="hover:text-terracotta-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                    {loc.email}
                                  </a>
                                </span>
                              )}
                              {loc.whatsapp && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <a
                                    href={`https://wa.me/${loc.whatsapp.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-success-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    WhatsApp
                                  </a>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Show hours when selected */}
                        {isSelected && loc.hours && loc.hours.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 border-t border-cream-200 pt-4"
                          >
                            <div className="flex items-start gap-3">
                              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                              <div className="flex-1 space-y-1">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-brown-500">{t("hours")}</h4>
                                {loc.hours.map((h) => (
                                  <div key={h.day} className="flex justify-between text-sm">
                                    <span className="font-medium text-brown-700">{h.day}</span>
                                    <span className="text-brown-600">
                                      {h.closed ? tc("closed") : `${h.open} - ${h.close}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3">
                              <a
                                href={getDirectionsUrl(loc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Navigation className="h-3.5 w-3.5" />
                                {t("getDirections")}
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </button>
                );
              })}

              {locations.length === 0 && (
                <p className="py-8 text-center text-sm text-brown-400">{t("noLocations")}</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map section for selected location */}
      {selectedLocation?.mapCoordinates && (
        <section className="bg-cream-200 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-brown-900">{selectedLocation.name}</h2>
              <p className="mt-2 text-sm text-brown-600">{selectedLocation.address}</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-cream-300 shadow-md">
              <iframe
                key={selectedLocation._id}
                title={`Map - ${selectedLocation.name}`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.mapCoordinates.lng - 0.01},${selectedLocation.mapCoordinates.lat - 0.007},${selectedLocation.mapCoordinates.lng + 0.01},${selectedLocation.mapCoordinates.lat + 0.007}&layer=mapnik&marker=${selectedLocation.mapCoordinates.lat},${selectedLocation.mapCoordinates.lng}`}
              />
            </div>
            <div className="mt-4 text-center">
              <a href={getDirectionsUrl(selectedLocation)} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  <Navigation className="h-4 w-4" />
                  {t("getDirections")}
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-brown-800 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-white">{t("newsletterTitle")}</h3>
              <p className="mt-1 text-cream-400">{t("newsletterDesc")}</p>
            </div>
            <div className="flex w-full max-w-sm gap-2">
              <Input type="email" placeholder={t("emailPlaceholder")} className="border-brown-700 bg-brown-800 text-white placeholder:text-cream-400/50" />
              <Button size="md" className="shrink-0 bg-terracotta-500 text-white shadow-sm hover:bg-terracotta-600">{t("subscribe")}</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
