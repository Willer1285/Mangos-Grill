import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Payment from "@/lib/db/models/payment";

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

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Admin payment PATCH error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
