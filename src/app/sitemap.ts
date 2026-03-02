import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mangosgrill.com";

const locales = ["en", "es"];

const staticPages = [
  "",
  "/menu",
  "/locations",
  "/reservations",
  "/jobs",
  "/contact",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}${page}`,
            es: `${BASE_URL}/es${page}`,
          },
        },
      });
    }
  }

  return entries;
}
