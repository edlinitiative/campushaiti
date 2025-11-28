/**
 * Update Application Status API
 * PATCH /api/uni/applications/[id]/status
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ApplicationStatus } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify authentication
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Get request body
    const body = await request.json();
    const { status, note } = body as { status: ApplicationStatus; note?: string };

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get application
    const applicationId = params.id;
    const applicationRef = db.collection("applicationItems").doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const applicationData = applicationDoc.data()!;
    const universityId = applicationData.universityId;

    // Check permissions
    if (decodedClaims.role !== "ADMIN") {
      // Check if user has university access
      const universityDoc = await db
        .collection("universities")
        .doc(universityId)
        .get();

      const universityData = universityDoc.data();

      const isLegacyAdmin = universityData?.adminUids?.includes(userId);
      const staffDoc = await db
        .collection("universities")
        .doc(universityId)
        .collection("staff")
        .doc(userId)
        .get();

      if (!isLegacyAdmin && !staffDoc.exists) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get user info for timeline
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const userName = userData?.name || userData?.displayName || "Unknown";

    const previousStatus = applicationData.status || "new";

    // Update application status
    await applicationRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(status === "in_review" && !applicationData.reviewedAt
        ? { reviewedAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
      ...(["accepted", "rejected"].includes(status) && !applicationData.decidedAt
        ? { decidedAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
    });

    // Add timeline event
    await applicationRef.collection("timeline").add({
      action: "status_changed",
      performedBy: userId,
      performedByName: userName,
      performedAt: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        note: note || undefined,
      },
      previousValue: previousStatus,
      newValue: status,
    });

    // Get updated application
    const updatedDoc = await applicationRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: applicationId,
      status: updatedData?.status,
      updatedAt: updatedData?.updatedAt,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
