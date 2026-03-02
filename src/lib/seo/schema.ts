/**
 * Schema.org JSON-LD generators for structured data.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mangosgrill.com";

export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Mango's Grill",
    description:
      "Authentic Venezuelan cuisine in the heart of Texas. Best arepas, pabellon criollo, and traditional dishes.",
    url: BASE_URL,
    telephone: "(713) 555-0199",
    email: "hello@mangosgrill.com",
    servesCuisine: ["Venezuelan", "Latin American"],
    priceRange: "$$",
    image: `${BASE_URL}/images/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1547 Westheimer Rd",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77098",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.7425,
      longitude: -95.3988,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "11:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "11:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "21:00",
      },
    ],
    acceptsReservations: true,
    menu: `${BASE_URL}/menu`,
    hasMenu: {
      "@type": "Menu",
      url: `${BASE_URL}/menu`,
    },
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Mango's Grill",
    description: "Authentic Venezuelan restaurant in Houston, Texas",
    url: BASE_URL,
    telephone: "(713) 555-0199",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1547 Westheimer Rd",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77098",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.7425,
      longitude: -95.3988,
    },
    image: `${BASE_URL}/images/og-image.jpg`,
    sameAs: [
      "https://instagram.com/mangosgrill",
      "https://facebook.com/mangosgrill",
      "https://twitter.com/mangosgrill",
    ],
  };
}

export function faqSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function menuItemSchema(item: {
  name: string;
  description: string;
  price: number;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: item.name,
    description: item.description,
    offers: {
      "@type": "Offer",
      price: item.price.toFixed(2),
      priceCurrency: "USD",
    },
    image: item.image || `${BASE_URL}/images/default-dish.jpg`,
  };
}
