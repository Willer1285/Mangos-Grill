import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import SiteConfig from "@/lib/db/models/site-config";

const DEFAULT_CONFIG = {
  brandName: "Mango's Grill",
  displayMode: "both",
  logo: null,
  logoDark: null,
  logoSize: 32,
  contactEmail: null,
  contactPhone: null,
  whatsapp: null,
  address: null,
  mapCoordinates: null,
  businessHours: [],
};

export async function GET() {
  try {
    await connectDB();
    const config = await SiteConfig.findOne().lean();
    if (!config) {
      return NextResponse.json(DEFAULT_CONFIG);
    }
    return NextResponse.json({
      brandName: config.brandName || DEFAULT_CONFIG.brandName,
      logo: config.logo || null,
      logoDark: config.logoDark || null,
      logoSize: config.logoSize ?? 32,
      displayMode: config.displayMode || "both",
      contactEmail: config.contactEmail || null,
      contactPhone: config.contactPhone || null,
      whatsapp: config.whatsapp || null,
      address: config.address || null,
      mapCoordinates: config.mapCoordinates || null,
      businessHours: config.businessHours || [],
    });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}
