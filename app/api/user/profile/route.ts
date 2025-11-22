import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile?userId=xxx
 * Fetch user profile data from Firestore
 */
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Get user profile from Firestore (basic info)
    let userData = null;
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } catch (dbError: any) {
      console.warn("Could not fetch user data:", dbError);
    }

    // Get full profile from profiles collection
    let profileData = null;
    try {
      const profileDoc = await db.collection("profiles").doc(userId).get();
      if (profileDoc.exists) {
        profileData = profileDoc.data();
      }
    } catch (dbError: any) {
      console.warn("Could not fetch profile data:", dbError);
    }

    // Get user from Firebase Auth
    const userRecord = await getAdminAuth().getUser(userId);

    return NextResponse.json({
      user: {
        phoneNumber: userData?.phoneNumber,
        fullName: userData?.fullName || userRecord.displayName,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
      },
      profile: profileData,
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update full user profile (for application form) in Firestore
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, name, role, ...profileData } = body;

    if (!uid) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Verify the user is authenticated
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Update users collection (basic info)
    await db.collection("users").doc(uid).set(
      {
        uid,
        email: decodedToken.email,
        name: name || decodedToken.email,
        role: role || "APPLICANT",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Update profiles collection (full application profile)
    await db.collection("profiles").doc(uid).set(
      {
        ...profileData,
        uid,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile
 * Legacy endpoint for basic profile updates
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, fullName, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Verify the user is authenticated
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    await db.collection("users").doc(userId).set(
      {
        phoneNumber,
        fullName,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
