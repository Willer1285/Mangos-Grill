import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Location from "@/lib/db/models/location";
import Table from "@/lib/db/models/table";

export async function GET() {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const locations = await Location.find().sort({ name: 1 }).lean();

    const withTables = await Promise.all(
      locations.map(async (loc) => {
        const tables = await Table.find({ location: loc.name })
          .sort({ number: 1 })
          .lean();
        return { ...loc, tables };
      })
    );

    return NextResponse.json(withTables);
  } catch (error) {
    console.error("Admin locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const { name, address, phone, image } = body;

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: "Name, address, and phone are required" },
        { status: 400 }
      );
    }

    const location = await Location.create({
      name,
      city: body.city || name,
      address,
      phone,
      image,
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Admin locations POST error:", error);
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}
