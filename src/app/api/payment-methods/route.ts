import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import SiteConfig from "@/lib/db/models/site-config";

export async function GET() {
  try {
    await connectDB();
    const config = await SiteConfig.findOne().select("paymentMethods").lean();
    const methods = config?.paymentMethods?.filter((m) => m.enabled) || [];
    return NextResponse.json(methods);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
