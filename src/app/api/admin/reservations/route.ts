import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize, sanitizeString } from "@/lib/db/sanitize";
import Reservation from "@/lib/db/models/reservation";
import User from "@/lib/db/models/user";

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

    // Search by customer name, email, phone, or idNumber
    if (search) {
      const s = sanitizeString(search);
      const matchingUsers = await User.find({
        $or: [
          { firstName: { $regex: s, $options: "i" } },
          { lastName: { $regex: s, $options: "i" } },
          { email: { $regex: s, $options: "i" } },
          { phone: { $regex: s, $options: "i" } },
          { idNumber: { $regex: s, $options: "i" } },
        ],
      }).select("_id").lean();
      const userIds = matchingUsers.map((u) => u._id);
      filter.customer = { $in: userIds };
    }

    // Manager can only see reservations from their assigned location
    if (result.user!.role === "Manager" && result.user!.location) {
      filter.location = result.user!.location;
    }

    const reservations = await Reservation.find(filter)
      .populate("customer", "firstName lastName email phone idNumber")
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

    if (!body.customer) {
      return NextResponse.json({ error: "A registered customer is required" }, { status: 400 });
    }

    // Verify the customer exists
    const customer = await User.findById(body.customer).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found. Please register the user first." }, { status: 404 });
    }

    const reservation = await Reservation.create(body);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Admin reservations POST error:", error);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
