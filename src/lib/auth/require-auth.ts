import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/constants";

/**
 * Verifies the current session and optionally checks for required roles.
 * Returns the session user or a 401/403 NextResponse.
 */
export async function requireAuth(roles?: Role[]) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (roles && roles.length > 0) {
    const userRole = session.user.role as Role;
    if (!roles.includes(userRole)) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return { user: session.user };
}
