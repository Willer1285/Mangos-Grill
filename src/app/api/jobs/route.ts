import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Job from "@/lib/db/models/job";

export async function GET() {
  try {
    await connectDB();

    const jobs = await Job.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
