"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";

export interface BrandConfig {
  brandName: string;
  logo: string | null;
  logoDark: string | null;
  logoSize: number;
  displayMode: "logo" | "text" | "both";
  currency: string;
  timezone: string;
  loaded: boolean;
}

const defaultBrand: BrandConfig = {
  brandName: "",
  logo: null,
  logoDark: null,
  logoSize: 32,
  displayMode: "both",
  currency: "USD",
  timezone: "America/New_York",
  loaded: false,
};

const BrandContext = createContext<BrandConfig>(defaultBrand);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((data) => {
        setBrand({
          brandName: data.brandName || "Mango's Grill",
          logo: data.logo || null,
          logoDark: data.logoDark || null,
          logoSize: data.logoSize ?? 32,
          displayMode: data.displayMode || "both",
          currency: data.currency || "USD",
          timezone: data.timezone || "America/New_York",
          loaded: true,
        });
      })
      .catch(() => {
        setBrand((prev) => ({ ...prev, brandName: "Mango's Grill", loaded: true }));
      });
  }, []);

  const value = useMemo(() => brand, [brand.brandName, brand.logo, brand.logoDark, brand.logoSize, brand.displayMode, brand.currency, brand.timezone, brand.loaded]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}

/**
 * Format a price using the configured currency.
 * Uses Intl.NumberFormat for proper locale-aware formatting.
 */
export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(getLocaleForCurrency(currency), {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)}`;
  }
}

/**
 * Format a date using the configured timezone.
 */
export function formatDate(
  date: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { timeZone: timezone, ...options });
  } catch {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString();
  }
}

/**
 * Format a date+time using the configured timezone.
 */
export function formatDateTime(
  date: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", { timeZone: timezone, ...options });
  } catch {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  }
}

function getLocaleForCurrency(currency: string): string {
  const map: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    VES: "es-VE",
    BRL: "pt-BR",
    ARS: "es-AR",
    MXN: "es-MX",
    COP: "es-CO",
    CLP: "es-CL",
    PEN: "es-PE",
    JPY: "ja-JP",
    CNY: "zh-CN",
    KRW: "ko-KR",
    INR: "hi-IN",
    CAD: "en-CA",
    AUD: "en-AU",
    CHF: "de-CH",
  };
  return map[currency] || "en-US";
}
