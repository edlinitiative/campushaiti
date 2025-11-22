import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

/**
 * One-time setup endpoint to create the first admin user
 * This should be disabled after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: fullName || email.split("@")[0],
    });

    // Create the user profile in Firestore with ADMIN role
    await db.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: "ADMIN",
      createdAt: Date.now(),
      emailVerified: true,
    });

    // Create the profile document
    await db.collection("profiles").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      fullName: fullName || userRecord.displayName,
      role: "ADMIN",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: "ADMIN",
      },
    });
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}
