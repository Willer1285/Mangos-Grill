"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import { useBrand } from "@/lib/brand/brand-context";
import { toast } from "sonner";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const brand = useBrand();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const coords = brand.mapCoordinates;
  const directionsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : brand.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(brand.address)}`
      : null;

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

          {/* Business info cards */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="space-y-6">
            {/* Phone */}
            {brand.contactPhone && (
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                    <Phone className="h-5 w-5 text-terracotta-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900">{t("phone")}</h3>
                    <a
                      href={`tel:${brand.contactPhone}`}
                      className="mt-1 block text-sm text-terracotta-600 hover:text-terracotta-700 hover:underline"
                    >
                      {brand.contactPhone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* WhatsApp */}
            {brand.whatsapp && (
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-500/10">
                    <MessageCircle className="h-5 w-5 text-success-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900">{t("whatsapp")}</h3>
                    <a
                      href={`https://wa.me/${brand.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-success-600 hover:text-success-700 hover:underline"
                    >
                      {brand.whatsapp}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email */}
            {brand.contactEmail && (
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                    <Mail className="h-5 w-5 text-terracotta-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900">{t("email")}</h3>
                    <a
                      href={`mailto:${brand.contactEmail}`}
                      className="mt-1 block text-sm text-terracotta-600 hover:text-terracotta-700 hover:underline"
                    >
                      {brand.contactEmail}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address */}
            {brand.address && (
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                    <MapPin className="h-5 w-5 text-terracotta-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900">{t("address")}</h3>
                    <p className="mt-1 text-sm text-brown-600">{brand.address}</p>
                    {directionsUrl && (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        {t("getDirections")}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Hours */}
            {brand.businessHours.length > 0 && (
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6 pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                      <Clock className="h-5 w-5 text-terracotta-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brown-900">{t("hours")}</h3>
                      <div className="mt-2 space-y-1.5">
                        {brand.businessHours.map((h) => (
                          <div key={h.day} className="flex justify-between text-sm">
                            <span className="font-medium text-brown-700">{h.day}</span>
                            <span className="text-brown-600">
                              {h.closed ? tc("closed") : `${h.open} - ${h.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* Map section */}
      {coords && (
        <section className="bg-cream-200 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-brown-900">{t("visitUs")}</h2>
              <p className="mt-2 text-sm text-brown-600">{t("visitUsDesc")}</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-xl border border-cream-300 shadow-md">
              <iframe
                title="Location Map"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01},${coords.lat - 0.007},${coords.lng + 0.01},${coords.lat + 0.007}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
              />
            </div>
            {directionsUrl && (
              <div className="mt-4 text-center">
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2">
                    <Navigation className="h-4 w-4" />
                    {t("getDirections")}
                  </Button>
                </a>
              </div>
            )}
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
