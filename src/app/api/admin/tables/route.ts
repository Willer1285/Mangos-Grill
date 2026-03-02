import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Table from "@/lib/db/models/table";

export async function GET() {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const tables = await Table.find().sort({ number: 1 }).lean();

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Admin tables GET error:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const { number, capacity, shape, position, status } = body;

    if (!number || !capacity || !position?.x === undefined || !position?.y === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const table = await Table.create({
      number,
      name: `Table ${number}`,
      capacity,
      shape: shape || "round",
      position,
      status: status || "Available",
      location: body.location || "Main",
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("Admin tables POST error:", error);
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
