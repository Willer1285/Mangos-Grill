import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import { auth } from "@/lib/auth";
import Reservation from "@/lib/db/models/reservation";
import User from "@/lib/db/models/user";
import { reservationSchema } from "@/lib/validators/reservation";
import { sendReservationConfirmation } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to make a reservation" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = sanitize(parsed.data);

    await connectDB();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const reservation = await Reservation.create({
      ...data,
      customer: session.user.id,
      status: "Pending",
    });

    await sendReservationConfirmation(
      user.email,
      `${user.firstName} ${user.lastName}`,
      data.date,
      data.time,
      data.partySize,
      data.location
    );

    return NextResponse.json(
      { message: "Reservation created successfully", reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
