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

export async function GET() {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const [users, orders, products, categories, reservations, payments, locations, tables, jobs] =
      await Promise.all([
        User.find({}).select("+password").lean(),
        Order.find({}).lean(),
        Product.find({}).lean(),
        Category.find({}).lean(),
        Reservation.find({}).lean(),
        Payment.find({}).lean(),
        Location.find({}).lean(),
        Table.find({}).lean(),
        Job.find({}).lean(),
      ]);

    const backup = {
      version: 1,
      createdAt: new Date().toISOString(),
      data: { users, orders, products, categories, reservations, payments, locations, tables, jobs },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mangos-grill-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
