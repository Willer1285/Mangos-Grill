"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Heart,
  UtensilsCrossed,
  TrendingUp,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";

type FilterType = "all" | "full-time" | "part-time";

export default function JobsPage() {
  const t = useTranslations("jobs");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const jobs = [
    {
      id: "head-chef",
      title: t("headChef"),
      department: t("kitchen"),
      type: t("fullTime"),
      typeFilter: "full-time",
      location: "Houston Montrose",
      salary: "$55,000 - $70,000/yr",
      description: t("headChefDesc"),
    },
    {
      id: "server",
      title: t("server"),
      department: t("frontOfHouse"),
      type: t("partTime"),
      typeFilter: "part-time",
      location: "East Austin",
      salary: "$15 - $20/hr + tips",
      description: t("serverDesc"),
    },
    {
      id: "line-cook",
      title: t("lineCook"),
      department: t("kitchen"),
      type: t("fullTime"),
      typeFilter: "full-time",
      location: "Deep Ellum Dallas",
      salary: "$35,000 - $42,000/yr",
      description: t("lineCookDesc"),
    },
    {
      id: "delivery-driver",
      title: t("deliveryDriver"),
      department: t("operations"),
      type: "Contract",
      typeFilter: "contract",
      location: t("allLocations"),
      salary: "$18 - $22/hr",
      description: t("deliveryDriverDesc"),
    },
  ];

  const perks = [
    {
      icon: Heart,
      title: t("benefits"),
      description: t("healthBenefitsDesc"),
    },
    {
      icon: UtensilsCrossed,
      title: t("meals"),
      description: t("freeMealsDesc"),
    },
    {
      icon: TrendingUp,
      title: t("growth"),
      description: t("growthDesc"),
    },
  ];

  const filters: { label: string; value: FilterType }[] = [
    { label: t("allLocations"), value: "all" },
    { label: t("fullTime"), value: "full-time" },
    { label: t("partTime"), value: "part-time" },
  ];

  const filtered =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j.typeFilter === activeFilter);

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <Badge variant="olive" className="mb-4">
          {t("hiring")}
        </Badge>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-cream-400">
          {t("hiringDesc")}
        </p>
      </section>

      {/* Filter chips */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6 pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-brown-900">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-brown-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-terracotta-500" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-terracotta-500" />
                          {job.department} &middot; {job.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-terracotta-600">
                        {job.salary}
                      </p>
                      <p className="text-sm text-brown-600">
                        {job.description}
                      </p>
                    </div>
                    <Button variant="primary" size="md" className="shrink-0">
                      {t("applyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-brown-500">
              {t("noOpenings")}
            </p>
          )}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">
            {t("whyWork")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                >
                  <Card className="h-full text-center transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/10">
                        <Icon className="h-6 w-6 text-terracotta-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-brown-900">
                        {perk.title}
                      </h3>
                      <p className="text-sm text-brown-600">
                        {perk.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
