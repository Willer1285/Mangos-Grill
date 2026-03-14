import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import SiteConfig from "@/lib/db/models/site-config";

export async function GET() {
  try {
    await connectDB();
    let config = await SiteConfig.findOne().lean();
    if (!config) {
      config = await SiteConfig.create({ brandName: "Mango's Grill", displayMode: "both" });
      config = config.toObject();
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Site config GET error:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const {
      brandName, logo, logoDark, logoSize, displayMode, homepageReviewsCount,
      currency, timezone, deliveryOptions, paymentMethods,
    } = body;

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({});
    }

    if (brandName !== undefined) config.brandName = brandName;
    if (logo !== undefined) config.logo = logo;
    if (logoDark !== undefined) config.logoDark = logoDark;
    if (logoSize !== undefined) config.logoSize = logoSize;
    if (displayMode !== undefined) config.displayMode = displayMode;
    if (homepageReviewsCount !== undefined) config.homepageReviewsCount = homepageReviewsCount;
    if (currency !== undefined) config.currency = currency;
    if (timezone !== undefined) config.timezone = timezone;
    if (deliveryOptions !== undefined) config.deliveryOptions = deliveryOptions;
    if (paymentMethods !== undefined) config.paymentMethods = paymentMethods;

    await config.save();

    return NextResponse.json(config);
  } catch (error) {
    console.error("Site config PUT error:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
