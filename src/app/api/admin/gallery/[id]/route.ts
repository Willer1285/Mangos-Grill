import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Gallery from "@/lib/db/models/gallery";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const body = sanitize(await req.json());
  const item = await Gallery.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const { id } = await params;
  await Gallery.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
