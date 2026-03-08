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

const jobs = [
  {
    id: "head-chef",
    title: "Head Chef",
    department: "Kitchen",
    type: "Full-time" as const,
    location: "Houston Montrose",
    salary: "$55,000 - $70,000/yr",
    description:
      "Lead our kitchen team to deliver authentic Venezuelan dishes. You will oversee menu execution, ingredient sourcing, and train junior cooks.",
  },
  {
    id: "server",
    title: "Server / Waitstaff",
    department: "Front of House",
    type: "Part-time" as const,
    location: "East Austin",
    salary: "$15 - $20/hr + tips",
    description:
      "Provide warm, attentive service to our guests. Prior restaurant experience preferred but not required -- we train our familia.",
  },
  {
    id: "line-cook",
    title: "Line Cook",
    department: "Kitchen",
    type: "Full-time" as const,
    location: "Deep Ellum Dallas",
    salary: "$35,000 - $42,000/yr",
    description:
      "Prepare dishes to order with consistency and speed. A passion for Latin American cuisine is a plus.",
  },
  {
    id: "delivery-driver",
    title: "Delivery Driver",
    department: "Operations",
    type: "Contract" as const,
    location: "All Locations",
    salary: "$18 - $22/hr",
    description:
      "Deliver orders to customers across the city. Valid driver's license and reliable vehicle required.",
  },
];

const perks = [
  {
    icon: Heart,
    title: "Health & Benefits",
    description:
      "Full-time team members receive comprehensive health, dental, and vision coverage.",
  },
  {
    icon: UtensilsCrossed,
    title: "Free Meals",
    description:
      "Enjoy a complimentary meal every shift and 50% discount for family and friends.",
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description:
      "We promote from within. Many of our managers started as line cooks or servers.",
  },
];

const filters: { label: string; value: FilterType }[] = [
  { label: "All Locations", value: "all" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
];

export default function JobsPage() {
  const t = useTranslations("jobs");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filtered =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j.type.toLowerCase() === activeFilter);

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <Badge variant="olive" className="mb-4">
          We&apos;re hiring
        </Badge>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-cream-400">
          Become part of our growing family and help bring the flavors of
          Venezuela to Texas.
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
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-brown-500">
              No openings match this filter right now.
            </p>
          )}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">
            Why Work With Us
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
