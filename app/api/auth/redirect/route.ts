import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/redirect
 * Get the appropriate redirect URL based on user role
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ redirectUrl: "/auth/signin" });
    }

    // Redirect based on role
    let redirectUrl = "/dashboard"; // Default for APPLICANT

    if (user.role === "ADMIN") {
      redirectUrl = "/admin";
    } else if (user.role === "SCHOOL_ADMIN") {
      redirectUrl = "/schools/selector"; // School selector for multi-school admins
    }

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Error determining redirect:", error);
    return NextResponse.json({ redirectUrl: "/dashboard" });
  }
}
