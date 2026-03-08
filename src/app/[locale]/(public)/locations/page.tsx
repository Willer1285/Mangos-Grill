"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const locations = [
  {
    id: "houston",
    city: "Houston",
    name: "Houston Montrose District",
    flagship: true,
    address: "1234 Westheimer Rd, Houston, TX 77006",
    hours: "Mon-Thu 11am-10pm | Fri-Sat 11am-11pm | Sun 10am-9pm",
    phone: "(713) 555-0142",
  },
  {
    id: "austin",
    city: "Austin",
    name: "East Austin",
    flagship: false,
    address: "5678 E 6th St, Austin, TX 78702",
    hours: "Mon-Thu 11am-10pm | Fri-Sat 11am-11pm | Sun 10am-9pm",
    phone: "(512) 555-0198",
  },
  {
    id: "dallas",
    city: "Dallas",
    name: "Deep Ellum Dallas",
    flagship: false,
    address: "910 Main St, Dallas, TX 75226",
    hours: "Mon-Thu 11am-10pm | Fri-Sat 11am-11pm | Sun 10am-9pm",
    phone: "(214) 555-0267",
  },
];

export default function LocationsPage() {
  const t = useTranslations("locations");

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          Find Us in Texas
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {t("title")}
        </h1>
      </section>

      {/* Aerial image placeholder */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 rounded-lg bg-cream-300 flex items-center justify-center">
          <span className="text-sm text-brown-500">
            Aerial view of locations
          </span>
        </div>
      </section>

      {/* Location Cards */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4 p-6 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-terracotta-500/10 text-terracotta-600">
                      {loc.city}
                    </Badge>
                    {loc.flagship && (
                      <Badge variant="olive">Flagship</Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-brown-900">
                    {loc.name}
                  </h3>

                  <div className="space-y-3 text-sm text-brown-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                      <span>{loc.address}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                      <span>{loc.hours}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" />
                      <span>{loc.phone}</span>
                    </div>
                  </div>

                  <Button variant="primary" className="mt-auto w-full">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
