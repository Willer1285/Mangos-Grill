import { NextResponse, type NextRequest } from "next/server";
import { sanitize } from "@/lib/db/sanitize";
import { contactSchema } from "@/lib/validators/contact";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { sendContactEmail } from "@/lib/email/resend";
import { connectDB } from "@/lib/db/connection";
import Location from "@/lib/db/models/location";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = checkRateLimit(ip, "contact");

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = sanitize(parsed.data);

    // Look up location email if a locationId was provided
    let recipientEmail: string | undefined;
    if (body.locationId) {
      await connectDB();
      const location = await Location.findById(body.locationId).select("email name").lean();
      if (location?.email) {
        recipientEmail = location.email;
      }
    }

    await sendContactEmail(
      data.email,
      data.phone,
      data.subject,
      data.message,
      recipientEmail
    );

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
