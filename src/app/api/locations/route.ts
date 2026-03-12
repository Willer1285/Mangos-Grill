import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Location from "@/lib/db/models/location";

export async function GET() {
  try {
    await connectDB();

    const locations = await Location.find({})
      .select("name city address phone email whatsapp image hours isFlagship mapCoordinates")
      .sort({ isFlagship: -1, name: 1 })
      .lean();

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Public locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
