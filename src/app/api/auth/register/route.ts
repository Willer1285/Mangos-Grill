import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, sanitize } from "@/lib/db";
import User from "@/lib/db/models/user";
import { registerSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sendWelcomeEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = checkRateLimit(ip, "register");
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = sanitize(await request.json());
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, idNumber, password } = parsed.data;

    await connectDB();

    // Check if user already exists by email, phone, or idNumber
    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    const existingByPhone = phone ? await User.findOne({ phone: phone.trim() }) : null;
    const existingByIdNumber = await User.findOne({ idNumber: idNumber.trim() });

    const existingUser = existingByEmail || existingByPhone || existingByIdNumber;

    if (existingUser) {
      // User was pre-created (e.g. from a manual order) — has no password yet
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.firstName = firstName.trim();
        existingUser.lastName = lastName.trim();
        existingUser.email = email.toLowerCase().trim();
        existingUser.phone = phone?.trim() || existingUser.phone;
        existingUser.idNumber = idNumber.trim();
        existingUser.password = hashedPassword;
        existingUser.provider = "credentials";
        await existingUser.save();

        return NextResponse.json(
          {
            message: "Account updated successfully. You can now sign in.",
            user: {
              id: existingUser._id.toString(),
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
            },
          },
          { status: 200 }
        );
      }

      // User is fully registered already
      const field = existingByEmail ? "email" : existingByPhone ? "phone" : "ID number";
      return NextResponse.json(
        { error: `An account with this ${field} already exists. Please sign in and update your missing data.` },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      idNumber: idNumber.trim(),
      password: hashedPassword,
      role: "Client",
      status: "Active",
      provider: "credentials",
    });

    sendWelcomeEmail(user.email, user.firstName).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
