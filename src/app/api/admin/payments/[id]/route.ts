import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Payment from "@/lib/db/models/payment";
import Order from "@/lib/db/models/order";
import User from "@/lib/db/models/user";
import { sendOrderConfirmation } from "@/lib/email/resend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate("order", "orderNumber total items deliveryType location status paymentStatus subtotal taxAmount")
      .populate("customer", "firstName lastName email")
      .populate("approvedBy", "firstName lastName")
      .lean();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Admin payment GET error:", error);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth(["SuperAdmin"]);
    if (result.error) return result.error;

    await connectDB();

    const { id } = await params;
    const body = sanitize(await req.json());
    const { action } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "Pending") {
      return NextResponse.json(
        { error: "Only pending payments can be approved or rejected" },
        { status: 400 }
      );
    }

    payment.status = action === "approve" ? "Completed" : "Failed";
    payment.approvedBy = new mongoose.Types.ObjectId(result.user!.id);
    await payment.save();

    // Update the associated order's payment status
    if (payment.order) {
      const newPaymentStatus = action === "approve" ? "Completed" : "Failed";
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: newPaymentStatus,
      });

      // Send confirmation email on approval
      if (action === "approve") {
        const order = await Order.findById(payment.order).lean();
        const customer = await User.findById(payment.customer)
          .select("email firstName")
          .lean();
        if (customer?.email && order) {
          sendOrderConfirmation(
            customer.email,
            customer.firstName || "Customer",
            order.orderNumber,
            order.total
          ).catch((err) => console.error("Failed to send order email:", err));
        }
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Admin payment PATCH error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
