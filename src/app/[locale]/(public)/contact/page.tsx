"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, MapPin, Send } from "lucide-react";
import { Button, Card, CardContent, Input, Textarea } from "@/components/ui";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <>
      {/* Header */}
      <section className="bg-brown-900 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-400">
          We&apos;d love to hear from you
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {t("title")}
        </h1>
      </section>

      {/* Contact Form + Info */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-brown-900">
              Send Us a Message
            </h2>
            <p className="mt-2 text-sm text-brown-600">
              Fill out the form below and we&apos;ll get back to you within 24
              hours.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                />
              </div>

              <Input
                label="Subject"
                type="text"
                placeholder="How can we help?"
              />

              <Textarea
                label="Message"
                placeholder="Tell us more about your inquiry..."
                rows={5}
              />

              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </motion.div>

          {/* Right: Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-6 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                  <Mail className="h-5 w-5 text-terracotta-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-900">Email</h3>
                  <p className="mt-1 text-sm text-brown-600">
                    hello@mangosgrill.com
                  </p>
                  <p className="text-sm text-brown-600">
                    catering@mangosgrill.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-6 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                  <Phone className="h-5 w-5 text-terracotta-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-900">Phone</h3>
                  <p className="mt-1 text-sm text-brown-600">
                    Houston: (713) 555-0142
                  </p>
                  <p className="text-sm text-brown-600">
                    Austin: (512) 555-0198
                  </p>
                  <p className="text-sm text-brown-600">
                    Dallas: (214) 555-0267
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-6 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                  <Clock className="h-5 w-5 text-terracotta-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-brown-900">Hours</h3>
                  <p className="mt-1 text-sm text-brown-600">
                    Mon - Thu: 11:00 AM - 10:00 PM
                  </p>
                  <p className="text-sm text-brown-600">
                    Fri - Sat: 11:00 AM - 11:00 PM
                  </p>
                  <p className="text-sm text-brown-600">
                    Sunday: 10:00 AM - 9:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Visit Us - Map placeholder */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-brown-900">Visit Us</h2>
            <p className="mt-2 text-sm text-brown-600">
              Find our nearest location and stop by for a meal.
            </p>
          </div>
          <div className="mt-8 flex h-80 items-center justify-center rounded-lg bg-cream-300">
            <div className="flex flex-col items-center gap-2 text-brown-500">
              <MapPin className="h-8 w-8" />
              <span className="text-sm">Interactive map coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="bg-brown-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-white">
                Stay in the Loop
              </h3>
              <p className="mt-1 text-cream-400">
                Subscribe to our newsletter for exclusive deals, new menu items,
                and event updates.
              </p>
            </div>
            <div className="flex w-full max-w-sm gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-brown-700 bg-brown-800 text-white placeholder:text-cream-400/50"
              />
              <Button variant="cta" size="md" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
