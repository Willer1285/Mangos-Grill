import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import FAQ from "@/lib/db/models/faq";

export async function GET() {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const items = await FAQ.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth(["SuperAdmin"]);
  if (error) return error;

  await connectDB();
  const body = sanitize(await req.json());
  const item = await FAQ.create({
    question: { en: body.question?.en || "", es: body.question?.es || "" },
    answer: { en: body.answer?.en || "", es: body.answer?.es || "" },
    sortOrder: body.sortOrder || 0,
    active: body.active !== false,
  });
  return NextResponse.json(item, { status: 201 });
}
