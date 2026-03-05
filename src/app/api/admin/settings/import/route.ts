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

    const backup = await req.json();

    if (!backup?.version || !backup?.data) {
      return NextResponse.json({ error: "Invalid backup file format" }, { status: 400 });
    }

    await connectDB();

    const { data } = backup;

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Reservation.deleteMany({}),
      Payment.deleteMany({}),
      Location.deleteMany({}),
      Table.deleteMany({}),
      Job.deleteMany({}),
    ]);

    // Restore data
    const results: Record<string, number> = {};

    if (data.users?.length) {
      await User.insertMany(data.users, { ordered: false }).catch(() => {});
      results.users = data.users.length;
    }
    if (data.orders?.length) {
      await Order.insertMany(data.orders, { ordered: false }).catch(() => {});
      results.orders = data.orders.length;
    }
    if (data.products?.length) {
      await Product.insertMany(data.products, { ordered: false }).catch(() => {});
      results.products = data.products.length;
    }
    if (data.categories?.length) {
      await Category.insertMany(data.categories, { ordered: false }).catch(() => {});
      results.categories = data.categories.length;
    }
    if (data.reservations?.length) {
      await Reservation.insertMany(data.reservations, { ordered: false }).catch(() => {});
      results.reservations = data.reservations.length;
    }
    if (data.payments?.length) {
      await Payment.insertMany(data.payments, { ordered: false }).catch(() => {});
      results.payments = data.payments.length;
    }
    if (data.locations?.length) {
      await Location.insertMany(data.locations, { ordered: false }).catch(() => {});
      results.locations = data.locations.length;
    }
    if (data.tables?.length) {
      await Table.insertMany(data.tables, { ordered: false }).catch(() => {});
      results.tables = data.tables.length;
    }
    if (data.jobs?.length) {
      await Job.insertMany(data.jobs, { ordered: false }).catch(() => {});
      results.jobs = data.jobs.length;
    }

    return NextResponse.json({ message: "Backup restored successfully", results });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import backup" }, { status: 500 });
  }
}
