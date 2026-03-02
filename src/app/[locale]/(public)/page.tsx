import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";
import { HeroSection } from "./_components/hero-section";
import { TasteGrid } from "./_components/taste-grid";
import { FeaturedDishes } from "./_components/featured-dishes";
import { ReservationCta } from "./_components/reservation-cta";
import { restaurantSchema, faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Mango's Grill | Authentic Venezuelan Cuisine in Texas",
  description:
    "Experience the best arepas, pabellon criollo and authentic Venezuelan food in Houston, Austin and Dallas. Order online or reserve your table today.",
};

export default function HomePage() {
  const t = useTranslations("home");

  const faqs = [
    {
      q: "What type of cuisine does Mango's Grill serve?",
      a: "We serve authentic Venezuelan cuisine, including arepas, pabellon criollo, cachapas, empanadas, and many more traditional dishes made with fresh ingredients.",
    },
    {
      q: "Do you offer delivery?",
      a: "Yes! We offer delivery through our own delivery team across all three of our locations in Houston, Austin, and Dallas.",
    },
    {
      q: "Can I make a reservation online?",
      a: "Absolutely! You can reserve your table directly through our website. Simply visit our Reservations page to select your preferred date, time, and table.",
    },
    {
      q: "Do you accommodate dietary restrictions?",
      a: "Yes, we offer gluten-free, vegetarian, and vegan options. Our menu clearly marks dishes with dietary tags so you can choose what suits you best.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, Mastercard, Amex), as well as Zelle and Binance Pay for online orders.",
    },
  ];

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs.map((f) => ({ question: f.q, answer: f.a })))),
        }}
      />

      <HeroSection />

      {/* Discount Banner */}
      <section className="bg-brown-900 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h3 className="text-lg font-semibold text-white">{t("discountTitle")}</h3>
          </div>
          <Button variant="cta" size="sm">
            {t("viewMenu")}
          </Button>
        </div>
      </section>

      {/* Taste of Venezuela */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">{t("tasteTitle")}</h2>
          <TasteGrid />
        </div>
      </section>

      {/* A Glimpse Inside */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">
            {t("glimpseTitle")}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg bg-cream-300">
                <div className="flex h-full items-center justify-center text-brown-500 text-sm">
                  Gallery {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-brown-900">
            {t("tasteOfHome")}
          </h2>
          <FeaturedDishes />
        </div>
      </section>

      {/* Reserve CTA */}
      <ReservationCta />

      {/* FAQ */}
      <section className="bg-brown-900 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold text-white">{t("faqTitle")}</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-brown-800">
                <AccordionTrigger className="text-white hover:text-terracotta-400 [&>svg]:text-cream-400">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-cream-400">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
