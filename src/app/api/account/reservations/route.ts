import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db";
import Reservation from "@/lib/db/models/reservation";

export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();

    const now = new Date();

    const [upcoming, past] = await Promise.all([
      Reservation.find({
        customer: user.id,
        date: { $gte: now },
        status: { $in: ["Pending", "Confirmed"] },
      })
        .sort({ date: 1 })
        .limit(5)
        .lean(),
      Reservation.find({
        customer: user.id,
        $or: [
          { date: { $lt: now } },
          { status: { $in: ["Completed", "Cancelled", "No-show"] } },
        ],
      })
        .sort({ date: -1 })
        .limit(20)
        .lean(),
    ]);

    const format = (r: typeof upcoming[0]) => ({
      id: r._id.toString(),
      date: r.date,
      time: r.time,
      guests: r.partySize,
      location: r.location,
      occasion: r.occasion || null,
      status: r.status,
      specialRequests: r.specialRequests || null,
    });

    return NextResponse.json({
      upcoming: upcoming.map(format),
      past: past.map(format),
    });
  } catch (error) {
    console.error("Account reservations API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
