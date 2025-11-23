import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/invite/accept
 * Accept an admin invitation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to accept invitations" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Find invitation
    const invitationsSnapshot = await db
      .collection("adminInvitations")
      .where("token", "==", token)
      .where("status", "==", "PENDING")
      .limit(1)
      .get();

    if (invitationsSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    const invitationDoc = invitationsSnapshot.docs[0];
    const invitation = invitationDoc.data();

    // Check if expired
    if (invitation.expiresAt < Date.now()) {
      await invitationDoc.ref.update({ status: "EXPIRED" });
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Verify email matches invitation
    if (user.email !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Check if user already has admin access
    const adminAccessDoc = await db.collection("adminAccess").doc(user.uid).get();
    
    if (adminAccessDoc.exists) {
      return NextResponse.json(
        { error: "You already have administrator access" },
        { status: 400 }
      );
    }

    // Grant VIEWER role (not full ADMIN)
    const adminAccess = {
      uid: user.uid,
      email: user.email,
      name: user.email?.split("@")[0] || "Admin",
      role: "VIEWER",
      grantedAt: Date.now(),
      grantedBy: invitation.invitedBy,
      invitationAcceptedAt: Date.now(),
    };

    await db.collection("adminAccess").doc(user.uid).set(adminAccess);

    // Set user role to ADMIN (but with VIEWER access level in adminAccess collection)
    await getAdminAuth().setCustomUserClaims(user.uid, { role: "ADMIN" });

    // Update invitation status
    await invitationDoc.ref.update({
      status: "ACCEPTED",
      acceptedAt: Date.now(),
      acceptedBy: user.uid,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted! You now have VIEWER access to the admin dashboard.",
      role: "VIEWER",
      note: "An existing administrator can upgrade your access level if needed.",
    });
  } catch (error) {
    console.error("Error accepting admin invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
