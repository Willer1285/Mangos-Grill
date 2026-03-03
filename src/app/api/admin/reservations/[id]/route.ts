import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Reservation from "@/lib/db/models/reservation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { id } = await params;

    // Manager can only update reservations from their location
    if (result.user!.role === "Manager" && result.user!.location) {
      const existing = await Reservation.findById(id).lean();
      if (existing && existing.location !== result.user!.location) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = sanitize(await req.json());

    const reservation = await Reservation.findByIdAndUpdate(id, body, { new: true })
      .populate("customer", "firstName lastName email")
      .populate("table")
      .lean();
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Admin reservation PUT error:", error);
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { id } = await params;

    // Manager can only delete reservations from their location
    if (result.user!.role === "Manager" && result.user!.location) {
      const existing = await Reservation.findById(id).lean();
      if (existing && existing.location !== result.user!.location) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reservation deleted" });
  } catch (error) {
    console.error("Admin reservation DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
  }
}
