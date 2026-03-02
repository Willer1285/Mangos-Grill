import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Location from "@/lib/db/models/location";
import Table from "@/lib/db/models/table";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    const { id } = await params;
    await connectDB();

    const body = sanitize(await request.json());
    const old = await Location.findById(id);
    const location = await Location.findByIdAndUpdate(id, body, { new: true });
    if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If name changed, update tables' location reference
    if (old && old.name !== location.name) {
      await Table.updateMany({ location: old.name }, { location: location.name });
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Admin location PUT error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    const { id } = await params;
    await connectDB();

    const location = await Location.findById(id);
    if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await Table.deleteMany({ location: location.name });
    await location.deleteOne();

    return NextResponse.json({ message: "Location deleted" });
  } catch (error) {
    console.error("Admin location DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
