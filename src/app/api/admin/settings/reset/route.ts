import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import Order from "@/lib/db/models/order";
import Product from "@/lib/db/models/product";
import Category from "@/lib/db/models/category";
import Reservation from "@/lib/db/models/reservation";
import Payment from "@/lib/db/models/payment";
import Location from "@/lib/db/models/location";
import Table from "@/lib/db/models/table";
import Job from "@/lib/db/models/job";

export async function POST(req: Request) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    const body = await req.json();
    if (body.confirmation !== "RESET") {
      return NextResponse.json({ error: "Invalid confirmation code" }, { status: 400 });
    }

    await connectDB();

    // Delete all data except the current SuperAdmin user
    const currentUserId = (result.user! as unknown as { _id: string })._id;

    await Promise.all([
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Reservation.deleteMany({}),
      Payment.deleteMany({}),
      Location.deleteMany({}),
      Table.deleteMany({}),
      Job.deleteMany({}),
      User.deleteMany({ _id: { $ne: currentUserId } }),
    ]);

    return NextResponse.json({ message: "Database reset successfully. Only your admin account was preserved." });
  } catch (error) {
    console.error("DB reset error:", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}
