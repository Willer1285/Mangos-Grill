import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import { auth } from "@/lib/auth";
import Reservation from "@/lib/db/models/reservation";
import { reservationSchema } from "@/lib/validators/reservation";

export async function POST(req: NextRequest) {
  try {
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

    const session = await auth();

    const reservation = await Reservation.create({
      ...data,
      ...(session?.user?.id ? { customer: session.user.id } : {}),
      status: "Pending",
    });

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
