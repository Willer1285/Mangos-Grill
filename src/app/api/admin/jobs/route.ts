import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectDB } from "@/lib/db/connection";
import { sanitize } from "@/lib/db/sanitize";
import Job from "@/lib/db/models/job";

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = sanitize(status);

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Admin jobs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuth(["SuperAdmin", "Staff"]);
    if (result.error) return result.error;

    await connectDB();

    const body = sanitize(await req.json());
    const { title, department, employmentType, location, description, requirements } = body;

    if (!title || !department || !employmentType || !location || !description?.en || !description?.es || !requirements?.en || !requirements?.es) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await Job.create({
      title,
      department,
      employmentType,
      location,
      description,
      requirements,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      status: body.status || "Draft",
      postedAt: body.status === "Active" ? new Date() : undefined,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Admin jobs POST error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
