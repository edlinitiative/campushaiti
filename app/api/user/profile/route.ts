import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber, fullName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Update user profile in Firestore
    try {
      await adminDb.collection("users").doc(userId).set(
        {
          phoneNumber,
          fullName: fullName || null,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (firestoreError: any) {
      console.error("Firestore write error:", firestoreError);
      // If Firestore doesn't exist yet, that's okay - just log it
      if (firestoreError.code !== 5 && !firestoreError.message?.includes("NOT_FOUND")) {
        throw firestoreError;
      }
      console.warn("Firestore database not available yet, skipping user profile storage");
    }

    // Update display name in Firebase Auth if provided
    if (fullName) {
      try {
        await adminAuth.updateUser(userId, {
          displayName: fullName,
        });
      } catch (authError) {
        console.warn("Could not update display name in Auth:", authError);
        // Continue anyway - this is not critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Verify the user is authenticated
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile from Firestore
    let phoneNumber = null;
    let fullName = null;

    try {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        phoneNumber = data?.phoneNumber;
        fullName = data?.fullName;
      }
    } catch (firestoreError: any) {
      console.warn("Could not fetch from Firestore:", firestoreError);
    }

    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUser(userId);

    return NextResponse.json({
      phoneNumber,
      fullName: fullName || userRecord.displayName,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Verify the user is authenticated
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
    console.error("Profile delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete profile" },
      { status: 500 }
    );
  }
}
