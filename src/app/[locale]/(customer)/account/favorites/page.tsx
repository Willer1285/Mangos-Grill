"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function FavoritesPage() {
  const t = useTranslations("customer");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brown-900">{t("favorites")}</h1>
        <p className="mt-1 text-sm text-brown-600">Your saved dishes will appear here.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center p-10 text-center">
          <Heart className="mb-3 h-12 w-12 text-cream-400" />
          <p className="text-sm font-medium text-brown-900">
            {t("noFavorites") || "No favorites yet"}
          </p>
          <p className="mt-1 text-xs text-brown-600">
            {t("noFavoritesDesc") || "Browse our menu and save your favorite dishes."}
          </p>
          <Link
            href="/menu"
            className="mt-4 text-sm font-medium text-terracotta-500 hover:text-terracotta-600"
          >
            {t("browseMenu") || "Browse Menu"}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
