import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/set-role
 * Set user role (temporary endpoint for initial setup)
 * In production, this should be protected by admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "SCHOOL_ADMIN", "APPLICANT"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, SCHOOL_ADMIN, or APPLICANT" },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    // Get user by email
    console.log(`Looking up user: ${email}`);
    const user = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);

    // Set custom claims
    console.log(`Setting ${role} role for ${email}...`);
    await adminAuth.setCustomUserClaims(user.uid, { role });

    return NextResponse.json({
      success: true,
      message: `Successfully set ${role} role for ${email}`,
      userId: user.uid,
      note: "User must sign out and sign in again for role to take effect",
    });
  } catch (error: any) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set user role" },
      { status: 500 }
    );
  }
}
