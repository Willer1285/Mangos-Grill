"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, MessageCircle, Star, Navigation } from "lucide-react";
import { Button, Card, CardContent, Badge, Spinner } from "@/components/ui";

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

export default function LocationsPage() {
  const t = useTranslations("locations");
  const tc = useTranslations("common");
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data: LocationData[]) => {
        setLocations(data);
        const flagship = data.find((l) => l.isFlagship);
        if (flagship) setSelectedId(flagship._id);
        else if (data.length > 0) setSelectedId(data[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedLocation = locations.find((l) => l._id === selectedId) || null;

  function getDirectionsUrl(loc: LocationData) {
    if (loc.mapCoordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${loc.mapCoordinates.lat},${loc.mapCoordinates.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`;
  }

  function formatHoursSummary(hours?: BusinessHours[]) {
    if (!hours || hours.length === 0) return null;
    const open = hours.filter((h) => !h.closed);
    if (open.length === 0) return tc("closed");
    const first = open[0];
    return `${first.open} - ${first.close}`;
  }

  return (
    <>
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          {t("findUs")}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">{t("title")}</h1>
      </section>

      {/* Interactive map for selected location */}
      {selectedLocation?.mapCoordinates && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-cream-300 shadow-md">
            <iframe
              key={selectedLocation._id}
              title={`Map - ${selectedLocation.name}`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.mapCoordinates.lng - 0.01},${selectedLocation.mapCoordinates.lat - 0.007},${selectedLocation.mapCoordinates.lng + 0.01},${selectedLocation.mapCoordinates.lat + 0.007}&layer=mapnik&marker=${selectedLocation.mapCoordinates.lat},${selectedLocation.mapCoordinates.lng}`}
            />
          </div>
        </section>
      )}

      {!selectedLocation?.mapCoordinates && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex h-64 items-center justify-center rounded-lg bg-cream-300">
            <span className="text-sm text-brown-500">{t("aerialView")}</span>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : locations.length === 0 ? (
          <div className="py-20 text-center text-brown-500">
            {t("noLocations")}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc, i) => {
              const isSelected = loc._id === selectedId;
              return (
                <motion.div
                  key={loc._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card
                    className={`h-full cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-terracotta-500 ring-offset-2" : ""
                    }`}
                    onClick={() => setSelectedId(loc._id)}
                  >
                    {loc.image && (
                      <div className="h-40 overflow-hidden">
                        <img src={loc.image} alt={loc.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="flex h-full flex-col gap-4 p-6 pt-6">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-terracotta-500/10 text-terracotta-600">{loc.city}</Badge>
                        {loc.isFlagship && (
                          <Badge variant="olive" className="gap-1">
                            <Star className="h-3 w-3" />
                            {t("flagship")}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-brown-900">{loc.name}</h3>
                      <div className="space-y-3 text-sm text-brown-700">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                          <span>{loc.address}</span>
                        </div>
                        {formatHoursSummary(loc.hours) && (
                          <div className="flex items-start gap-2.5">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                            <span>{formatHoursSummary(loc.hours)}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2.5">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                          <a href={`tel:${loc.phone}`} className="hover:text-terracotta-600 hover:underline">
                            {loc.phone}
                          </a>
                        </div>
                        {loc.email && (
                          <div className="flex items-start gap-2.5">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                            <a href={`mailto:${loc.email}`} className="hover:text-terracotta-600 hover:underline">
                              {loc.email}
                            </a>
                          </div>
                        )}
                        {loc.whatsapp && (
                          <div className="flex items-start gap-2.5">
                            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                            <a
                              href={`https://wa.me/${loc.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-success-600 hover:underline"
                            >
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Expanded hours when selected */}
                      {isSelected && loc.hours && loc.hours.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="border-t border-cream-200 pt-3"
                        >
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brown-500">
                            {t("hoursTitle")}
                          </h4>
                          <div className="space-y-1">
                            {loc.hours.map((h) => (
                              <div key={h.day} className="flex justify-between text-xs">
                                <span className="font-medium text-brown-700">{h.day}</span>
                                <span className="text-brown-600">
                                  {h.closed ? tc("closed") : `${h.open} - ${h.close}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <a href={getDirectionsUrl(loc)} target="_blank" rel="noopener noreferrer" className="mt-auto">
                        <Button variant="primary" className="w-full gap-2">
                          <Navigation className="h-4 w-4" />
                          {t("getDirections")}
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
