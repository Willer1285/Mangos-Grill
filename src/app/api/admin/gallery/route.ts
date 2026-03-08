import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Gallery from "@/lib/db/models/gallery";

export async function GET() {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const items = await Gallery.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const body = sanitize(await req.json());
  const item = await Gallery.create({
    image: body.image,
    caption: body.caption || "",
    sortOrder: body.sortOrder || 0,
    active: body.active !== false,
  });
  return NextResponse.json(item, { status: 201 });
}
