import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/require-auth";
import Notification from "@/lib/db/models/notification";

export async function GET() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();

    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    await connectDB();

    await Notification.updateMany(
      { user: user.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
