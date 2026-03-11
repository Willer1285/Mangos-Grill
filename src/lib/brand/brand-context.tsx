"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface BrandConfig {
  brandName: string;
  logo: string | null;
  logoDark: string | null;
  logoSize: number;
  displayMode: "logo" | "text" | "both";
  contactEmail: string | null;
  contactPhone: string | null;
  whatsapp: string | null;
  address: string | null;
  mapCoordinates: { lat: number; lng: number } | null;
  businessHours: BusinessHours[];
}

const defaultBrand: BrandConfig = {
  brandName: "Mango's Grill",
  logo: null,
  logoDark: null,
  logoSize: 32,
  displayMode: "both",
  contactEmail: null,
  contactPhone: null,
  whatsapp: null,
  address: null,
  mapCoordinates: null,
  businessHours: [],
};

const BrandContext = createContext<BrandConfig>(defaultBrand);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((data) => {
        setBrand({
          brandName: data.brandName || defaultBrand.brandName,
          logo: data.logo || null,
          logoDark: data.logoDark || null,
          logoSize: data.logoSize ?? 32,
          displayMode: data.displayMode || "both",
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          whatsapp: data.whatsapp || null,
          address: data.address || null,
          mapCoordinates: data.mapCoordinates || null,
          businessHours: data.businessHours || [],
        });
      })
      .catch(() => {});
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}
