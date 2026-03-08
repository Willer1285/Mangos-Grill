"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface BrandConfig {
  brandName: string;
  logo: string | null;
  displayMode: "logo" | "text" | "both";
}

const defaultBrand: BrandConfig = {
  brandName: "Mango's Grill",
  logo: null,
  displayMode: "both",
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
          displayMode: data.displayMode || "both",
        });
      })
      .catch(() => {});
  }, []);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}
