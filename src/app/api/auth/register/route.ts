import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, sanitize } from "@/lib/db";
import User from "@/lib/db/models/user";
import { registerSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/auth/rate-limit";

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

    const { firstName, lastName, email, phone, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      password: hashedPassword,
      role: "Client",
      status: "Active",
      provider: "credentials",
    });

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
