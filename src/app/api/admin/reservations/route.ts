import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize, sanitizeString } from "@/lib/db/sanitize";
import Reservation from "@/lib/db/models/reservation";

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = sanitize(status);
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: d, $lt: nextDay };
    }
    if (search) {
      const s = sanitizeString(search);
      filter.$or = [
        { guestName: { $regex: s, $options: "i" } },
        { guestEmail: { $regex: s, $options: "i" } },
        { guestPhone: { $regex: s, $options: "i" } },
      ];
    }

    // Manager can only see reservations from their assigned location
    if (result.user!.role === "Manager" && result.user!.location) {
      filter.location = result.user!.location;
    }

    const reservations = await Reservation.find(filter)
      .populate("customer", "firstName lastName email")
      .populate("table")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Admin reservations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());

    // Manager auto-assigns their location
    if (result.user!.role === "Manager" && result.user!.location) {
      body.location = result.user!.location;
    }

    if (!body.date || !body.time || !body.partySize || !body.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reservation = await Reservation.create(body);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Admin reservations POST error:", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
