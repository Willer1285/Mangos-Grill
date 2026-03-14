import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { HeroSection } from "./_components/hero-section";
import { HomepageCategories, HomepageBestSellers } from "./_components/homepage-data";
import { HomepageGallery } from "./_components/homepage-gallery";
import { HomepageReviews } from "./_components/homepage-reviews";
import { HomepageFAQs } from "./_components/homepage-faqs";
import { ReservationCta } from "./_components/reservation-cta";
import { restaurantSchema } from "@/lib/seo/schema";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Mango's Grill | Authentic Venezuelan Cuisine in Texas",
  description:
    "Experience the best arepas, pabellon criollo and authentic Venezuelan food in Houston, Austin and Dallas. Order online or reserve your table today.",
};

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema()) }}
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

      {/* Gallery - Dynamic from DB */}
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
          <HomepageGallery />
        </div>
      </section>

      {/* Reviews - Real data from DB in infinite carousel */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-terracotta-500">
            What Our Guests Say
          </p>
          <h2 className="mt-2 mb-10 text-center text-3xl font-bold text-brown-900">A Taste of Home</h2>
          <HomepageReviews />
        </div>
      </section>

      {/* Reserve CTA */}
      <ReservationCta />

      {/* FAQ - Dynamic from DB */}
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
          <HomepageFAQs />
        </div>
      </section>
    </>
  );
}
