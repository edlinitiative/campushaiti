/**
 * Add Note API
 * POST /api/uni/applications/[id]/notes
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { CreateNoteRequest } from "@/lib/types/uni";
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

    const body = (await request.json()) as CreateNoteRequest;
    const { text, isInternal } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    // Get application
    const applicationRef = db.collection("applicationItems").doc(params.id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const applicationData = applicationDoc.data()!;
    const universityId = applicationData.universityId;

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

    // Get user info
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const userName = userData?.name || userData?.displayName || "Unknown";

    // Get staff role if available
    const staffDoc = await db
      .collection("universities")
      .doc(universityId)
      .collection("staff")
      .doc(userId)
      .get();
    const staffRole = staffDoc.exists ? staffDoc.data()?.role : "ADMIN";

    // Add note
    const noteRef = await applicationRef.collection("notes").add({
      authorId: userId,
      authorName: userName,
      authorRole: staffRole,
      text: text.trim(),
      isInternal,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add timeline event
    await applicationRef.collection("timeline").add({
      action: "note_added",
      performedBy: userId,
      performedByName: userName,
      performedAt: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        isInternal,
        noteId: noteRef.id,
      },
    });

    return NextResponse.json({ success: true, id: noteRef.id });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
