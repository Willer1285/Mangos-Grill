import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db";
import Order from "@/lib/db/models/order";

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ customer: user.id }),
    ]);

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.orderNumber,
        date: o.createdAt,
        items: o.items.map((i: { name: string; quantity: number; price: number }) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: o.total,
        status: o.status,
        deliveryType: o.deliveryType,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Account orders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
