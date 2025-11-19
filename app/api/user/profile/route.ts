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
    await adminDb.collection("users").doc(userId).set(
      {
        phoneNumber,
        fullName: fullName || null,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Update display name in Firebase Auth if provided
    if (fullName) {
      try {
        await adminAuth.updateUser(userId, {
          displayName: fullName,
        });
      } catch (authError) {
        console.warn("Could not update display name in Auth:", authError);
        // Continue anyway - Firestore update succeeded
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
