import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    await requireRole(["ADMIN"]);

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(userId);

    // Delete user data from Firestore
    try {
      // Delete user document
      await adminDb.collection("users").doc(userId).delete();

      // Delete all user's passkeys
      const passkeysSnapshot = await adminDb
        .collection("passkeys")
        .where("userId", "==", userId)
        .get();
      
      const batch = adminDb.batch();
      passkeysSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (firestoreError: any) {
      console.warn("Could not delete from Firestore:", firestoreError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
