/**
 * Bulk Assign Reviewer API
 * POST /api/uni/applications/bulk-assign
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { BulkAssignRequest } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
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
    const body = (await request.json()) as BulkAssignRequest;
    const { applicationIds, reviewerId, reviewerName } = body;

    if (!applicationIds || applicationIds.length === 0) {
      return NextResponse.json(
        { error: "Application IDs are required" },
        { status: 400 }
      );
    }

    if (!reviewerId) {
      return NextResponse.json(
        { error: "Reviewer ID is required" },
        { status: 400 }
      );
    }

    // Get user info for timeline
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const userName = userData?.name || userData?.displayName || "Unknown";

    // Update all applications in batch
    const batch = db.batch();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    for (const applicationId of applicationIds) {
      const applicationRef = db.collection("applicationItems").doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        continue;
      }

      const applicationData = applicationDoc.data()!;

      // Check permissions for this application
      const universityId = applicationData.universityId;

      if (decodedClaims.role !== "ADMIN") {
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
          continue; // Skip applications user doesn't have access to
        }
      }

      // Update application
      batch.update(applicationRef, {
        assignedReviewer: reviewerId,
        assignedReviewerName: reviewerName,
        updatedAt: timestamp,
      });

      // Add timeline event
      const timelineRef = applicationRef.collection("timeline").doc();
      batch.set(timelineRef, {
        action: "reviewer_assigned",
        performedBy: userId,
        performedByName: userName,
        performedAt: timestamp,
        details: {
          reviewerId,
          reviewerName,
        },
        previousValue: applicationData.assignedReviewer || null,
        newValue: reviewerId,
      });
    }

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      updated: applicationIds.length,
    });
  } catch (error) {
    console.error("Error bulk assigning reviewer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
