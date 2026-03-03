import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Order from "@/lib/db/models/order";

const VALID_STATUSES = ["New", "Preparing", "Ready", "InTransit", "Delivered", "Cancelled"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id).populate("customer").lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Manager can only view orders from their location
    if (result.user!.role === "Manager" && result.user!.location && order.location !== result.user!.location) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin order GET error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin", "Manager"]);
    if (result.error) return result.error;

    await connectDB();

    const { id } = await params;
    const body = sanitize(await req.json());

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Manager can only update orders from their location
    if (result.user!.role === "Manager" && result.user!.location && existing.location !== result.user!.location) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Status-only update (works for any current status)
    if (body.status && Object.keys(body).length === 1) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      existing.status = body.status;
      await existing.save();
      return NextResponse.json(existing.toObject());
    }

    // Full edit only allowed while status is "New"
    if (existing.status !== "New") {
      return NextResponse.json(
        { error: "Orders can only be edited while in 'New' status" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "items", "deliveryType", "tableNumber", "paymentMethod",
      "paymentStatus", "subtotal", "taxAmount", "taxRate", "total", "notes",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (existing as unknown as Record<string, unknown>)[field] = body[field];
      }
    }
    if (body.status && VALID_STATUSES.includes(body.status)) {
      existing.status = body.status;
    }

    await existing.save();
    return NextResponse.json(existing.toObject());
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
