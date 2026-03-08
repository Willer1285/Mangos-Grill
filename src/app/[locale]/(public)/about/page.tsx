"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Target, Eye, Heart, ChefHat } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Link } from "@/i18n/navigation";

const values = [
  {
    icon: Target,
    title: "Mission",
    description:
      "To share the rich, vibrant flavors of Venezuelan cuisine with every guest who walks through our doors, creating unforgettable dining experiences rooted in tradition.",
  },
  {
    icon: Eye,
    title: "Vision",
    description:
      "To become the leading Venezuelan restaurant brand in the United States, celebrated for authenticity, quality, and the warmth of our hospitality.",
  },
  {
    icon: Heart,
    title: "Values",
    description:
      "Family, authenticity, and community drive everything we do. We source responsibly, cook with passion, and treat every guest like familia.",
  },
];

const stats = [
  { value: "2018", label: "Year Founded" },
  { value: "50K+", label: "Happy Customers" },
  { value: "35+", label: "Menu Items" },
  { value: "100%", label: "Authentic Recipes" },
];

const team = [
  {
    name: "Carlos Mendoza",
    role: "Founder & Executive Chef",
  },
  {
    name: "Isabella Reyes",
    role: "Head Chef, Houston",
  },
  {
    name: "Diego Vargas",
    role: "Operations Manager",
  },
  {
    name: "Sofia Herrera",
    role: "Pastry Chef",
  },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <>
      {/* Header */}
      <section className="bg-brown-800 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          About Mango&apos;s Grill
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-4xl font-semibold text-white">
          {t("title")}
        </h1>
      </section>

      {/* Story Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold text-brown-900">
              Our Story
            </h2>
            <p className="mt-4 leading-relaxed text-brown-700">
              Mango&apos;s Grill was born from a simple dream: to bring the
              authentic flavors of Venezuela to the heart of Texas. Founded in
              2018 by Chef Carlos Mendoza, our restaurant started as a small
              kitchen in Houston&apos;s vibrant Montrose District.
            </p>
            <p className="mt-4 leading-relaxed text-brown-700">
              Growing up in Caracas, Carlos learned to cook from his
              grandmother, who believed that food was the purest expression of
              love. Every arepa, every pabellon, every tequeño on our menu
              carries that tradition forward -- made from scratch daily with
              recipes passed down through generations.
            </p>
            <p className="mt-4 leading-relaxed text-brown-700">
              Today, with three locations across Texas, we continue to honor
              those roots while embracing the diverse culinary landscape of our
              adopted home. Every dish tells a story, and we invite you to be
              part of ours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="flex h-80 items-center justify-center rounded-lg bg-cream-300">
              <span className="text-sm text-brown-500">
                Restaurant story photo
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Purpose & Values */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-brown-900">
              Our Purpose & Values
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-brown-600">
              Everything we do is guided by our commitment to authenticity,
              community, and the joy of sharing great food.
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
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
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-brown-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="bg-brown-800 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className="text-4xl font-bold text-terracotta-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-cream-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-brown-900">
            The People Behind the Flavor
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-brown-600">
            Meet the passionate team that brings Venezuelan cuisine to life
            every single day.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full text-center transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-4 p-6 pt-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-300">
                    <ChefHat className="h-8 w-8 text-brown-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-900">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm text-brown-600">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold text-brown-900">
              Come Experience the Taste of Venezuela
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brown-600">
              Whether you&apos;re craving a classic arepa or exploring
              Venezuelan cuisine for the first time, we can&apos;t wait to
              welcome you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/menu">View Our Menu</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/locations">Find a Location</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
