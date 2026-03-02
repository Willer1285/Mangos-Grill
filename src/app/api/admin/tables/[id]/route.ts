import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import Table from "@/lib/db/models/table";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    const { id } = await params;
    await connectDB();

    const table = await Table.findByIdAndDelete(id);
    if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Table deleted" });
  } catch (error) {
    console.error("Admin table DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}
