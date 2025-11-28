/**
 * Update Document Status API
 * PATCH /api/uni/applications/[id]/documents/[docId]
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { UpdateDocumentStatusRequest } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    const body = (await request.json()) as UpdateDocumentStatusRequest;
    const { status, rejectionReason } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Get application
    const applicationRef = db.collection("applicationItems").doc(params.id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const applicationData = applicationDoc.data()!;
    const universityId = applicationData.universityId;

    // Check permissions (same as status update)
    if (decodedClaims.role !== "ADMIN") {
      const universityDoc = await db.collection("universities").doc(universityId).get();
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

    // Get user info
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const userName = userData?.name || userData?.displayName || "Unknown";

    // Update document
    const docRef = applicationRef.collection("documents").doc(params.docId);
    await docRef.update({
      status,
      reviewedBy: userId,
      reviewedByName: userName,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(rejectionReason ? { rejectionReason } : {}),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
