"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui";
import { MapPin, UtensilsCrossed } from "lucide-react";
import { LazyMotionProvider } from "@/lib/framer-lazy";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative flex min-h-[520px] items-center overflow-hidden bg-brown-800 lg:min-h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-r from-brown-800/95 via-brown-800/80 to-brown-800/40" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <LazyMotionProvider>
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-terracotta-500/20 px-4 py-2 text-sm font-medium text-terracotta-400">
              <MapPin className="h-4 w-4" />
              Now in Houston, Austin &amp; Dallas
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-cream-300">{t("heroSubtitle")}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/reservations">
                <Button size="lg" className="gap-2 bg-terracotta-500 text-white shadow-sm hover:bg-terracotta-600">
                  {t("reserveTable")}
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="secondary" size="lg" className="gap-2 border-cream-400/30 text-cream-200 hover:bg-cream-200/10">
                  <UtensilsCrossed className="h-4 w-4" />
                  {t("viewMenu")}
                </Button>
              </Link>
            </div>
          </m.div>
        </LazyMotionProvider>
      </div>
    </section>
  );
}
