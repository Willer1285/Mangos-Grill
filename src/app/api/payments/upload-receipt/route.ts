import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import Payment from "@/lib/db/models/payment";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth();
    if (result.error) return result.error;

    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const method = formData.get("paymentMethod") as string;
    const reference = formData.get("reference") as string;
    const receiptFile = formData.get("file") as File | null;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    let receiptImageUrl: string | undefined;

    if (receiptFile) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(receiptFile.name) || ".png";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      await writeFile(path.join(uploadDir, safeName), buffer);

      receiptImageUrl = `/uploads/receipts/${safeName}`;
    }

    await connectDB();

    // Update the payment record with receipt info
    const payment = await Payment.findOne({ order: orderId });
    if (payment) {
      if (receiptImageUrl) payment.receiptImage = receiptImageUrl;
      if (reference) payment.referenceNumber = reference;
      if (reference) payment.transactionId = reference;
      await payment.save();
    }

    return NextResponse.json(
      { success: true, receiptImage: receiptImageUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload receipt error:", error);
    return NextResponse.json(
      { error: "Failed to upload receipt" },
      { status: 500 }
    );
  }
}
