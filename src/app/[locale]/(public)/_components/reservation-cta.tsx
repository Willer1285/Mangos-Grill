"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { CalendarDays } from "lucide-react";

export function ReservationCta() {
  const t = useTranslations("home");

  return (
    <section className="bg-cream-200 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold text-brown-900">{t("reserveTonight")}</h2>
          <p className="mt-2 text-brown-600">{t("reserveDesc")}</p>
          <Link href="/reservations" className="mt-6 inline-block">
            <Button variant="primary" size="lg" className="gap-2">
              <CalendarDays className="h-5 w-5" />
              {t("reserveTable")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
