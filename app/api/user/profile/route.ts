import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile?userId=xxx
 * Fetch user profile data
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile from Realtime Database (basic info)
    let userData = null;
    try {
      const userDoc = await collection("users").doc(userId).get();
      if (userDoc.exists) {
        userData = userDoc.data();
      }
    } catch (dbError: any) {
      console.warn("Could not fetch user data:", dbError);
    }

    // Get full profile from profiles collection
    let profileData = null;
    try {
      const profileDoc = await collection("profiles").doc(userId).get();
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
 * Update full user profile (for application form)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, userData, profileData } = await request.json();

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

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update users collection (basic info)
    if (userData) {
      try {
        await collection("users").doc(userId).set(
          {
            ...userData,
            updatedAt: Date.now(),
          },
          { merge: true }
        );

        // Update display name in Firebase Auth if provided
        if (userData.fullName || userData.name) {
          try {
            await getAdminAuth().updateUser(userId, {
              displayName: userData.fullName || userData.name,
            });
          } catch (authError) {
            console.warn("Could not update display name in Auth:", authError);
          }
        }
      } catch (dbError: any) {
        console.error("Database write error (users):", dbError);
        return NextResponse.json(
          { error: "Failed to update user data" },
          { status: 500 }
        );
      }
    }

    // Update profiles collection (full application profile)
    if (profileData) {
      try {
        await collection("profiles").doc(userId).set(
          {
            ...profileData,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (dbError: any) {
        console.error("Database write error (profiles):", dbError);
        return NextResponse.json(
          { error: "Failed to update profile data" },
          { status: 500 }
        );
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

/**
 * POST /api/user/profile
 * Legacy endpoint for basic profile updates
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber, fullName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Update user profile in Realtime Database
    try {
      await collection("users").doc(userId).set(
        {
          phoneNumber,
          fullName: fullName || null,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (dbError: any) {
      console.error("Database write error:", dbError);
      console.warn("Database not available yet, skipping user profile storage");
    }

    // Update display name in Firebase Auth if provided
    if (fullName) {
      try {
        await getAdminAuth().updateUser(userId, {
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

/**
 * DELETE /api/user/profile
 * Delete user profile and associated data
 */
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

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete user data from Realtime Database
    try {
      // Delete user document
      await collection("users").doc(userId).delete();

      // Delete profile document
      await collection("profiles").doc(userId).delete();

      // Delete all user's passkeys
      const passkeysSnapshot = await collection("passkeys")
        .where("userId", "==", userId)
        .get();
      
      for (const doc of passkeysSnapshot.docs) {
        await collection("passkeys").doc(doc.id).delete();
      }
    } catch (dbError: any) {
      console.warn("Could not delete from database:", dbError);
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
