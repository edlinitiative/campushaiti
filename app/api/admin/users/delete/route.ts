import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";



export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

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
    await getAdminAuth().deleteUser(userId);

    // Delete user data from Firestore
    try {
      // Delete user document
      await db.collection("users").doc(userId).delete();

      // Delete all user's passkeys
      const passkeysSnapshot = await db.collection("passkeys")
        .where("userId", "==", userId)
        .get();
      
      for (const doc of passkeysSnapshot.docs) {
        await db.collection("passkeys").doc(doc.id).delete();
      }
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
