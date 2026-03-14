import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/db/models/user";

// GET - return current user's favorites list
export async function GET() {
  const result = await requireAuth();
  if ("error" in result) return result.error;

  await connectDB();
  const user = await User.findById(result.user.id).select("favorites").lean();
  return NextResponse.json(user?.favorites ?? []);
}

// POST - toggle a product in favorites (add or remove)
export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if ("error" in result) return result.error;

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(result.user.id).select("favorites");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const index = user.favorites.findIndex(
    (id: { toString(): string }) => id.toString() === productId
  );

  if (index > -1) {
    user.favorites.splice(index, 1);
    await user.save();
    return NextResponse.json({ action: "removed", favorites: user.favorites });
  } else {
    user.favorites.push(productId);
    await user.save();
    return NextResponse.json({ action: "added", favorites: user.favorites });
  }
}
