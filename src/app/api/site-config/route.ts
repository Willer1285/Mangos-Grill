import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import SiteConfig from "@/lib/db/models/site-config";

const DEFAULT_CONFIG = {
  brandName: "Mango's Grill",
  displayMode: "both",
  logo: null,
  logoDark: null,
  logoSize: 32,
  currency: "USD",
  timezone: "America/New_York",
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
      currency: config.currency || "USD",
      timezone: config.timezone || "America/New_York",
    });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}
