import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/access/[uid]
 * Remove admin access for a user (SUPER ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const user = await getServerUser();

    // Only full ADMIN (not VIEWER) can delete other admins
    if (!user || user.role !== "ADMIN" || user.adminAccessLevel !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Requires full admin access" },
        { status: 401 }
      );
    }

    const { uid } = await params;

    // Prevent self-deletion
    if (uid === user.uid) {
      return NextResponse.json(
        { error: "Cannot remove your own admin access" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    // Check if target user has admin access
    const adminAccessDoc = await db.collection("adminAccess").doc(uid).get();
    
    if (!adminAccessDoc.exists) {
      return NextResponse.json(
        { error: "User does not have admin access" },
        { status: 404 }
      );
    }

    // Remove admin access record
    await db.collection("adminAccess").doc(uid).delete();

    // Remove ADMIN custom claim (set back to APPLICANT)
    await auth.setCustomUserClaims(uid, { role: "APPLICANT" });

    console.log(`[Delete Admin] Admin access removed for ${uid} by ${user.uid}`);

    return NextResponse.json({
      success: true,
      message: "Admin access removed successfully",
    });
  } catch (error) {
    console.error("Error removing admin access:", error);
    return NextResponse.json(
      { error: "Failed to remove admin access" },
      { status: 500 }
    );
  }
}
