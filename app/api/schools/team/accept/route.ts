import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/schools/team/accept
 * Accept a team invitation
 */
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Find invitation
    const invitationsSnapshot = await db
      .collection("teamInvitations")
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

    // Get user (they must be signed in)
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to accept invitations" },
        { status: 401 }
      );
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(session);
    const userEmail = decodedClaims.email;

    // Verify email matches invitation
    if (userEmail !== invitation.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Get university
    const universityRef = db.collection("universities").doc(invitation.universityId);
    const universityDoc = await universityRef.get();

    if (!universityDoc.exists) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      );
    }

    const university = universityDoc.data();

    if (!university) {
      return NextResponse.json(
        { error: "University data not found" },
        { status: 404 }
      );
    }

    // Get user name
    const userRecord = await getAdminAuth().getUser(decodedClaims.uid);
    const userName = userRecord.displayName || userEmail?.split("@")[0] || "User";

    // Add to team
    const teamMember = {
      uid: decodedClaims.uid,
      email: userEmail || "",
      name: userName,
      role: invitation.role,
      addedAt: Date.now(),
      addedBy: invitation.invitedBy,
      invitedAt: invitation.createdAt,
      invitationAcceptedAt: Date.now(),
    };

    const updates: any = {
      [`team.${decodedClaims.uid}`]: teamMember,
      updatedAt: Date.now(),
    };

    // Also add to adminUids for backwards compatibility
    const adminUids = university.adminUids || [];
    if (!adminUids.includes(decodedClaims.uid)) {
      updates.adminUids = [...adminUids, decodedClaims.uid];
    }

    await universityRef.update(updates);

    // Update invitation status
    await invitationDoc.ref.update({
      status: "ACCEPTED",
      acceptedAt: Date.now(),
    });

    // Update user role to SCHOOL_ADMIN if not already
    if (decodedClaims.role !== "SCHOOL_ADMIN") {
      await getAdminAuth().setCustomUserClaims(decodedClaims.uid, {
        role: "SCHOOL_ADMIN",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      universityName: university.name,
      role: invitation.role,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
