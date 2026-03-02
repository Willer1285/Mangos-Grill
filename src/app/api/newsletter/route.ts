import { NextResponse, type NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validators/contact";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // TODO: Add to mailing list (e.g. Resend audience, Mailchimp, etc.)
    console.log("Newsletter subscription:", parsed.data.email);

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
