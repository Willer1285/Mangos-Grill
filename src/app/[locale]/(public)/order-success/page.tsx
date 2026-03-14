"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { CheckCircle, Mail, ChefHat, Bell, ShoppingBag, ClipboardList } from "lucide-react";

const steps = [
  {
    icon: Mail,
    titleKey: "confirmationSent",
    descKey: "confirmationSentDesc",
  },
  {
    icon: ChefHat,
    titleKey: "orderPreparation",
    descKey: "orderPreparationDesc",
  },
  {
    icon: Bell,
    titleKey: "readyPickup",
    descKey: "readyPickupDesc",
  },
] as const;

export default function OrderSuccessPage() {
  const t = useTranslations("orderSuccess");
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "MG-000000";
  const isPending = searchParams.get("pending") === "true";

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-500/20">
            <CheckCircle className="h-12 w-12 text-success-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-semibold text-gold-500">{t("gracias")}</h1>
          <p className="mt-2 text-lg text-cream-400">{t("title")}</p>
          <p className="mt-4 text-sm text-cream-400/80">{t("desc")}</p>
          {isPending && (
            <div className="mx-auto mt-4 max-w-md rounded-lg bg-warning-500/20 px-4 py-3">
              <p className="text-sm font-medium text-warning-500">
                {t("pendingPayment") || "Your payment is being reviewed. Your order will be processed once the payment is confirmed by our team."}
              </p>
            </div>
          )}
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Order number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 rounded-lg border-2 border-terracotta-500/20 bg-terracotta-500/5 p-6 text-center"
        >
          <p className="text-sm text-brown-600">{t("orderNumber")}</p>
          <p className="mt-1 text-2xl font-bold tracking-wider text-terracotta-500">
            {orderNumber}
          </p>
        </motion.div>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-brown-900">
            {t("whatsNext")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.titleKey}
                className="flex flex-col items-center rounded-lg border border-cream-200 p-6 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cream-200">
                  <step.icon className="h-6 w-6 text-terracotta-500" />
                </div>
                <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta-500 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-brown-900">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-1 text-xs text-brown-500">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link href="/account/orders">
            <Button variant="primary" size="lg" className="gap-2">
              <ClipboardList className="h-5 w-5" />
              {t("trackOrder")}
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="secondary" size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t("continueShopping")}
            </Button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
