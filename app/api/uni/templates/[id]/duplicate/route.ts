/**
 * Duplicate Template API
 * POST /api/uni/templates/[id]/duplicate
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import * as admin from "firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Get original template
    const templateDoc = await db.collection("messageTemplates").doc(params.id).get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = templateDoc.data()!;
    const universityId = templateData.universityId;

    // Check permissions
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

    // Create duplicate
    const duplicateRef = await db.collection("messageTemplates").add({
      ...templateData,
      name: `${templateData.name} (Copy)`,
      isDefault: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
    });

    return NextResponse.json({ id: duplicateRef.id, success: true });
  } catch (error) {
    console.error("Error duplicating template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
