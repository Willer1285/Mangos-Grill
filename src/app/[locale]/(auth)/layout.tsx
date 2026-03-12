"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useBrand } from "@/lib/brand/brand-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const brand = useBrand();

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      {/* Simple header */}
      <header className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          {brand.loaded && (brand.displayMode === "logo" || brand.displayMode === "both") && brand.logo && (
            <div className="relative shrink-0" style={{ height: brand.logoSize, width: brand.logoSize }}>
              <Image src={brand.logo} alt={brand.brandName} fill className="object-contain" />
            </div>
          )}
          {brand.loaded && (brand.displayMode === "text" || brand.displayMode === "both") && (
            <span className="text-lg font-semibold text-brown-900">{brand.brandName}</span>
          )}
        </Link>
      </header>

      {/* Auth content centered */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
