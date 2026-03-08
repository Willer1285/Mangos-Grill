import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui";
import { HeroSection } from "./_components/hero-section";
import { HomepageCategories, HomepageBestSellers } from "./_components/homepage-data";
import { ReservationCta } from "./_components/reservation-cta";
import { restaurantSchema, faqSchema } from "@/lib/seo/schema";
import { ChevronRight, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Mango's Grill | Authentic Venezuelan Cuisine in Texas",
  description:
    "Experience the best arepas, pabellon criollo and authentic Venezuelan food in Houston, Austin and Dallas. Order online or reserve your table today.",
};

export default function HomePage() {
  const t = useTranslations("home");

  const faqs = [
    {
      q: "Do you have vegetarian or vegan options?",
      a: "Absolutely! We have plenty of plant-based options. Our black bean arepas, plantain dishes, and various salads are all vegan-friendly. Just ask your server for our green menu.",
    },
    {
      q: "What are your hours of operation?",
      a: "We're open Monday to Friday from 11am to 10pm, Friday & Saturday 11am-11pm, and Sunday 10am-9pm. Sunday brunch starts at 10am until 2pm.",
    },
    {
      q: "Can I make a reservation for a large group?",
      a: "Of course! We love hosting gatherings. For groups of 8+, we recommend booking in advance. Call us or book online and we'll make it special.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit and debit cards, Apple Pay, and cash. For online orders, we also accept PayPal and Binance Pay.",
    },
    {
      q: "What makes your food authentically Venezuelan?",
      a: "Everything! We import key ingredients directly from Venezuela. Our arepas are hand-pressed using traditional P.A.N. flour, and our recipes come from Chef Isabela's family — passed down through three generations.",
    },
    {
      q: "Do you cater for food allergies?",
      a: "Yes! Many of our dishes are naturally gluten-free. We clearly mark allergens on our menu and our staff is trained to help you find safe options. Just let us know!",
    },
    {
      q: "Do you offer delivery or takeout?",
      a: "Yes to both! Order directly through our website for pickup or delivery. Our online menu is available for all locations.",
    },
    {
      q: "Do you offer catering for events?",
      a: "Absolutely! From intimate gatherings to corporate events, we bring the full Venezuelan experience to you. Contact us for custom catering packages.",
    },
  ];

  const testimonials = [
    {
      text: "The arepas here taste exactly like my abuela used to make. It's the closest thing to home I've found in Texas. Absolutely incredible!",
      author: "Maria Gonzalez, Houston",
      rating: 5,
    },
    {
      text: "Best Venezuelan food in Texas, hands down. The pabellon criollo is perfection. We drive 45 minutes just to eat here every weekend.",
      author: "James & Lisa Park, Austin",
      rating: 5,
    },
    {
      text: "The cachapas are out of this world! My Venezuelan friends say it's the most authentic they've had outside Caracas. A true gem.",
      author: "Carlos Mendez, Dallas",
      rating: 5,
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
      <section className="bg-terracotta-500 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <h3 className="text-xl font-bold text-white">Get Discount Voucher Up To 20%</h3>
            <p className="mt-1 text-sm text-white/80">
              Join our rewards program to receive exclusive discounts and special seasonal offers.
            </p>
          </div>
          <Link href="/menu">
            <Button variant="secondary" size="sm" className="gap-1 border-white/30 bg-white/10 text-white hover:bg-white/20">
              Order Now <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Category Icons */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HomepageCategories />
        </div>
      </section>

      {/* Our Specialties - Best Sellers from DB */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-terracotta-500">
            Our Specialties
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-brown-900">{t("tasteTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-brown-600">
            Each dish is a celebration of Venezuelan culinary heritage, made with fresh ingredients and authentic recipes.
          </p>
          <HomepageBestSellers />
        </div>
      </section>

      {/* A Glimpse Inside */}
      <section className="bg-cream-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-terracotta-500">
            Our Gallery
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-brown-900">
            {t("glimpseTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-brown-600">
            Moments, dishes, and smiles from our kitchen to your table.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Interior", span: "md:col-span-2 md:row-span-2" },
              { label: "Plating" },
              { label: "Kitchen" },
              { label: "Ambiance" },
              { label: "Dining" },
            ].map((item, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl bg-brown-700 ${item.span || ""}`}
              >
                <div className="flex aspect-square h-full items-center justify-center text-sm text-cream-400">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-terracotta-500">
            What Our Guests Say
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-brown-900">A Taste of Home</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-xl border border-cream-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brown-700">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-brown-900">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reserve CTA */}
      <ReservationCta />

      {/* FAQ */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-terracotta-500">
            Got A Question?
          </p>
          <h2 className="mt-2 text-center text-3xl font-bold text-brown-900">
            Got Questions? We&apos;ve Got Answers
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-brown-600">
            Everything you need to know about Mango&apos;s Grill.
          </p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
            <Accordion type="single" collapsible>
              {faqs.slice(0, 4).map((faq, i) => (
                <AccordionItem key={i} value={`faq-l-${i}`} className="border-cream-300">
                  <AccordionTrigger className="text-left text-sm font-medium text-brown-900 hover:text-terracotta-500 [&>svg]:text-brown-500">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-brown-600">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Accordion type="single" collapsible>
              {faqs.slice(4).map((faq, i) => (
                <AccordionItem key={i} value={`faq-r-${i}`} className="border-cream-300">
                  <AccordionTrigger className="text-left text-sm font-medium text-brown-900 hover:text-terracotta-500 [&>svg]:text-brown-500">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-brown-600">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
