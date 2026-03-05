import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Order from "@/lib/db/models/order";
import Payment from "@/lib/db/models/payment";
import User from "@/lib/db/models/user";

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = sanitize(status);

    // Manager can only see orders from their assigned location
    if (result.user!.role === "Manager" && result.user!.location) {
      filter.location = result.user!.location;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const {
      customerIdNumber,
      items,
      deliveryType,
      tableNumber,
      location,
      paymentMethod,
      paymentStatus,
      subtotal,
      taxAmount,
      taxRate,
      total,
      notes,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    if (!customerIdNumber) {
      return NextResponse.json({ error: "Customer ID number is required" }, { status: 400 });
    }

    // Determine location: Manager uses their assigned location, SuperAdmin must provide it
    const orderLocation = result.user!.role === "Manager"
      ? result.user!.location
      : location;

    if (!orderLocation) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Find or create customer by ID number
    let customer = await User.findOne({ idNumber: customerIdNumber });
    if (!customer) {
      const guestEmail = `guest_${Date.now()}@mangos-grill.local`;
      customer = await User.create({
        firstName: "Client",
        lastName: customerIdNumber,
        email: guestEmail,
        idNumber: customerIdNumber,
        role: "Client",
        status: "Active",
        provider: "credentials",
      });
    }
    const customerId = customer._id.toString();

    // Generate correlative order number
    const lastOrder = await Order.findOne().sort({ createdAt: -1 }).select("orderNumber").lean();
    let nextNum = 1;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    const orderNumber = `ORD-${String(nextNum).padStart(6, "0")}`;

    const order = await Order.create({
      orderNumber,
      customer: customerId,
      items,
      deliveryType: deliveryType || "Dine-in",
      tableNumber,
      location: orderLocation,
      status: "New",
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: paymentStatus || "Pending",
      subtotal,
      taxAmount,
      taxRate: taxRate || 0.1,
      total,
      notes,
    });

    // Create payment record if method specified
    if (paymentMethod) {
      const txId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      await Payment.create({
        transactionId: txId,
        order: order._id,
        customer: customerId,
        amount: total,
        status: paymentStatus === "Completed" ? "Completed" : "Pending",
        method: paymentMethod,
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Admin orders POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
