import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart/cart-context";
import { FavoritesProvider } from "@/lib/favorites/favorites-context";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { BrandProvider } from "@/lib/brand/brand-context";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mango's Grill | Authentic Venezuelan Cuisine in Texas",
    template: "%s | Mango's Grill",
  },
  description:
    "Experience authentic Venezuelan cuisine at Mango's Grill. Best arepas, pabellon criollo, and traditional dishes in Houston, Austin, and Dallas, Texas.",
  keywords: [
    "Venezuelan restaurant",
    "arepas",
    "Venezuelan food",
    "Texas",
    "Houston",
    "Austin",
    "Dallas",
    "pabellon criollo",
    "authentic Venezuelan cuisine",
    "best arepas in Texas",
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Mango's Grill",
    locale: "en_US",
    alternateLocale: "es_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-cream-100 font-sans text-brown-900 antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <BrandProvider>
              <CartProvider>
                <FavoritesProvider>
                  {children}
                </FavoritesProvider>
              </CartProvider>
            </BrandProvider>
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "bg-white border-cream-300 shadow-lg rounded-lg",
                title: "text-brown-900 font-semibold",
                description: "text-brown-600",
                success: "border-l-4 border-l-success-500",
                error: "border-l-4 border-l-error-500",
                warning: "border-l-4 border-l-warning-500",
                info: "border-l-4 border-l-info-500",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
