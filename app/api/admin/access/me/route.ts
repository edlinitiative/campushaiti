import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/access/me
 * Get current user's admin access level
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      role: user.adminAccessLevel || "VIEWER",
    });
  } catch (error) {
    console.error("Error getting current user access:", error);
    return NextResponse.json(
      { error: "Failed to get user access" },
      { status: 500 }
    );
  }
}
