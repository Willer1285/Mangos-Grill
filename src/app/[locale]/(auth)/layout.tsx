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
          {(brand.displayMode === "logo" || brand.displayMode === "both") && brand.logo ? (
            <div className="relative shrink-0" style={{ height: brand.logoSize, width: brand.logoSize }}>
              <Image src={brand.logo} alt={brand.brandName} fill className="object-contain" />
            </div>
          ) : (brand.displayMode === "logo" || brand.displayMode === "both") && !brand.logo ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2C10 6 7 8 7 12c0 2.8 2.2 5 5 5s5-2.2 5-5c0-4-3-6-5-10zm0 13c-1.7 0-3-1.3-3-3 0-1.5.8-2.8 2-4.4.4.5.7 1 1 1.5.3-.5.6-1 1-1.5 1.2 1.6 2 2.9 2 4.4 0 1.7-1.3 3-3 3z" />
              </svg>
            </div>
          ) : null}
          {(brand.displayMode === "text" || brand.displayMode === "both") && (
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
