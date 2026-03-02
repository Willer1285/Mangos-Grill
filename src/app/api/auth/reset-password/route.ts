import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB, sanitize } from "@/lib/db";
import User from "@/lib/db/models/user";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = sanitize(await request.json());
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    await connectDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
