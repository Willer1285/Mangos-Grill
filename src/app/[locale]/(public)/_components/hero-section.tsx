"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden bg-brown-900">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-brown-900/90 via-brown-900/70 to-brown-900/50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-lg text-cream-300">{t("heroSubtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/menu">
              <Button variant="cta" size="lg">
                {t("viewMenu")}
              </Button>
            </Link>
            <Link href="/reservations">
              <Button variant="secondary" size="lg" className="border-cream-300 text-cream-200 hover:bg-cream-200/10">
                {t("reserveTable")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
