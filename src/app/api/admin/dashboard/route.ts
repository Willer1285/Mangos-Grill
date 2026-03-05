import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import Order from "@/lib/db/models/order";
import Reservation from "@/lib/db/models/reservation";
import User from "@/lib/db/models/user";

export async function GET() {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const locationFilter: Record<string, unknown> = {};
    if (result.user!.role === "Manager" && result.user!.location) {
      locationFilter.location = result.user!.location;
    }

    const [
      totalOrders,
      totalSalesAgg,
      dishesSoldAgg,
      deliveredOrders,
      cancelledOrders,
      confirmedReservations,
      cancelledReservations,
      pendingReservations,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(locationFilter),
      Order.aggregate([
        { $match: { ...locationFilter, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { ...locationFilter, status: { $ne: "Cancelled" } } },
        { $unwind: "$items" },
        { $group: { _id: null, total: { $sum: "$items.quantity" } } },
      ]),
      Order.countDocuments({ ...locationFilter, status: "Delivered" }),
      Order.countDocuments({ ...locationFilter, status: "Cancelled" }),
      Reservation.countDocuments({ ...locationFilter, status: "Confirmed" }),
      Reservation.countDocuments({ ...locationFilter, status: "Cancelled" }),
      Reservation.countDocuments({ ...locationFilter, status: "Pending" }),
      result.user!.role === "SuperAdmin"
        ? User.countDocuments({ status: "Active" })
        : Promise.resolve(0),
      Order.find(locationFilter)
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      totalOrders,
      totalSales: totalSalesAgg[0]?.total || 0,
      dishesSold: dishesSoldAgg[0]?.total || 0,
      deliveredOrders,
      cancelledOrders,
      confirmedReservations,
      cancelledReservations,
      pendingReservations,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
