import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Payment from "@/lib/db/models/payment";

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = sanitize(status);
    if (paymentMethod) filter.method = sanitize(paymentMethod);
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("order", "orderNumber total items deliveryType location status paymentStatus")
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return NextResponse.json({
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin payments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
