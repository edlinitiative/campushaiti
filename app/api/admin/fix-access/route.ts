import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/fix-access
 * Fix admin access for a user who accepted invitation but doesn't have proper access
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    // Check if user has an accepted invitation
    const invitationsSnapshot = await db
      .collection("adminInvitations")
      .where("email", "==", user.email)
      .where("status", "==", "ACCEPTED")
      .limit(1)
      .get();

    if (invitationsSnapshot.empty) {
      return NextResponse.json(
        { error: "No accepted invitation found for your email" },
        { status: 404 }
      );
    }

    const invitation = invitationsSnapshot.docs[0].data();

    // Check if adminAccess record exists
    const adminAccessDoc = await db.collection("adminAccess").doc(user.uid).get();
    
    const updates = [];

    // Create or update adminAccess record
    if (!adminAccessDoc.exists) {
      const adminAccess = {
        uid: user.uid,
        email: user.email,
        name: user.email?.split("@")[0] || "Admin",
        role: "VIEWER",
        grantedAt: Date.now(),
        grantedBy: invitation.invitedBy,
        invitationAcceptedAt: invitation.acceptedAt || Date.now(),
      };
      await db.collection("adminAccess").doc(user.uid).set(adminAccess);
      updates.push("Created adminAccess record");
    } else {
      updates.push("AdminAccess record already exists");
    }

    // Check and update custom claims
    const userRecord = await auth.getUser(user.uid);
    const currentClaims = userRecord.customClaims || {};
    
    if (currentClaims.role !== "ADMIN") {
      await auth.setCustomUserClaims(user.uid, { role: "ADMIN" });
      updates.push("Set custom claims: role=ADMIN");
    } else {
      updates.push("Custom claims already set correctly");
    }

    // Force user to refresh their token
    return NextResponse.json({
      success: true,
      message: "Admin access verified and fixed if needed",
      updates,
      nextSteps: "Please refresh the page or sign out and sign back in to see admin access",
    });
  } catch (error) {
    console.error("Error fixing admin access:", error);
    return NextResponse.json(
      { error: "Failed to fix admin access" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/fix-access
 * Check current admin access status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    // Check adminAccess record
    const adminAccessDoc = await db.collection("adminAccess").doc(user.uid).get();
    const adminAccessExists = adminAccessDoc.exists;
    const adminAccessData = adminAccessDoc.exists ? adminAccessDoc.data() : null;

    // Check custom claims
    const userRecord = await auth.getUser(user.uid);
    const customClaims = userRecord.customClaims || {};

    // Check for accepted invitation
    const invitationsSnapshot = await db
      .collection("adminInvitations")
      .where("email", "==", user.email)
      .where("status", "==", "ACCEPTED")
      .limit(1)
      .get();

    const hasAcceptedInvitation = !invitationsSnapshot.empty;
    const invitationData = hasAcceptedInvitation ? invitationsSnapshot.docs[0].data() : null;

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        adminAccessLevel: user.adminAccessLevel,
      },
      adminAccess: {
        exists: adminAccessExists,
        data: adminAccessData,
      },
      customClaims,
      invitation: {
        hasAccepted: hasAcceptedInvitation,
        data: invitationData,
      },
      status: {
        hasAdminClaim: customClaims.role === "ADMIN",
        hasAdminAccessRecord: adminAccessExists,
        needsFix: hasAcceptedInvitation && (!adminAccessExists || customClaims.role !== "ADMIN"),
      },
    });
  } catch (error) {
    console.error("Error checking admin access:", error);
    return NextResponse.json(
      { error: "Failed to check admin access" },
      { status: 500 }
    );
  }
}
