import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db";
import Order from "@/lib/db/models/order";
import Reservation from "@/lib/db/models/reservation";

export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();

    const [totalOrders, recentOrders, reservationCount, upcomingReservation] = await Promise.all([
      Order.countDocuments({ customer: user.id }),
      Order.find({ customer: user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Reservation.countDocuments({ customer: user.id }),
      Reservation.findOne({
        customer: user.id,
        date: { $gte: new Date() },
        status: { $in: ["Pending", "Confirmed"] },
      })
        .sort({ date: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        reservations: reservationCount,
        favorites: 0,
        loyaltyPoints: 0,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.orderNumber,
        date: o.createdAt,
        items: o.items.map((i: { name: string }) => i.name).join(", "),
        total: o.total,
        status: o.status,
      })),
      upcomingReservation: upcomingReservation
        ? {
            date: upcomingReservation.date,
            time: upcomingReservation.time,
            location: upcomingReservation.location,
            guests: upcomingReservation.partySize,
            status: upcomingReservation.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
