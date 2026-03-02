import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Category from "@/lib/db/models/category";

export async function GET() {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const categories = await Category.find().sort({ sortOrder: 1 }).lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const { name, description, image, status } = body;

    if (!name?.en || !name?.es) {
      return NextResponse.json({ error: "Name in both languages is required" }, { status: 400 });
    }

    const category = await Category.create({
      name,
      description,
      image,
      status: status || "Active",
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
