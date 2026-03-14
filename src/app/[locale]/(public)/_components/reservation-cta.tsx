"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui";
import { CalendarDays, Phone } from "lucide-react";
import { LazyMotionProvider } from "@/lib/framer-lazy";

export function ReservationCta() {
  const t = useTranslations("home");

  return (
    <section className="bg-brown-800 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LazyMotionProvider>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white">{t("reserveTonight")}</h2>
            <p className="mt-3 text-cream-400">{t("reserveDesc")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/reservations">
                <Button size="lg" className="gap-2 bg-terracotta-500 text-white shadow-sm hover:bg-terracotta-600">
                  <CalendarDays className="h-5 w-5" />
                  Book Now
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="gap-2 border-cream-400/30 text-cream-200 hover:bg-cream-200/10">
                <Phone className="h-5 w-5" />
                Call Us
              </Button>
            </div>
          </m.div>
        </LazyMotionProvider>
      </div>
    </section>
  );
}
