import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db";
import User from "@/lib/db/models/user";

export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();
    const dbUser = await User.findById(user.id).select("-password").lean();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phone: dbUser.phone || "",
      avatar: dbUser.avatar || null,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    const body = await req.json();
    const { firstName, lastName, phone } = body;

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone || "",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
