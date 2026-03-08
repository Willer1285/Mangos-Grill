import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB, sanitize } from "@/lib/db";
import User from "@/lib/db/models/user";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = checkRateLimit(ip, "forgotPassword");
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = sanitize(await request.json());
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      provider: "credentials",
    }).select("+resetPasswordToken +resetPasswordExpires");

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we sent a reset link.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      message: "If an account with that email exists, we sent a reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
