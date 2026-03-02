import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import Payment from "@/lib/db/models/payment";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;
    const { user } = result;

    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const method = formData.get("paymentMethod") as string;
    const reference = formData.get("reference") as string;
    const receiptFile = formData.get("receipt") as File | null;

    if (!orderId || !method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In production, upload receiptFile to cloud storage (S3, Cloudinary, etc.)
    const receiptImage = receiptFile
      ? `/uploads/receipts/${Date.now()}_${receiptFile.name}`
      : undefined;

    const transactionId = `TXN-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    await connectDB();

    const payment = await Payment.create({
      transactionId,
      order: orderId,
      customer: user!.id,
      amount: 0, // Will be resolved from order total
      method,
      status: "Pending",
      ...(method === "Zelle" && { zelleReference: reference }),
      ...(method === "Binance" && { binanceReference: reference }),
      receiptImage,
    });

    return NextResponse.json(
      { paymentId: payment._id, status: "Pending" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload receipt error:", error);
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    );
  }
}
