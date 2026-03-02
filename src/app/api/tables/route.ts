import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Table from "@/lib/db/models/table";

export async function GET() {
  try {
    await connectDB();

    const tables = await Table.find().lean();

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}
