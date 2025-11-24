import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * POST /api/admin/grant-self
 * Emergency endpoint to grant yourself ADMIN access in adminAccess collection
 * Should only be used for initial setup when no other admins exist
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only allow if user already has ADMIN role in custom claims
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You must have ADMIN role in Firebase custom claims first" },
        { status: 403 }
      );
    }

    const db = getAdminDb();

    // Check if adminAccess collection is empty or user doesn't exist
    const existingAccess = await db.collection("adminAccess").doc(user.uid).get();
    
    if (existingAccess.exists) {
      const data = existingAccess.data();
      return NextResponse.json({
        success: true,
        message: "You already have admin access",
        access: data,
      });
    }

    // Try to get user's name from their profile
    let userName = user.email?.split("@")[0] || "Admin";
    try {
      const profileDoc = await db.collection("profiles").doc(user.uid).get();
      if (profileDoc.exists) {
        const profileData = profileDoc.data();
        if (profileData?.firstName && profileData?.lastName) {
          userName = `${profileData.firstName} ${profileData.lastName}`;
        } else if (profileData?.firstName) {
          userName = profileData.firstName;
        }
      }
    } catch (profileError) {
      console.log("Could not fetch profile for name, using email prefix");
    }

    // Create adminAccess document with ADMIN role
    await db.collection("adminAccess").doc(user.uid).set({
      uid: user.uid,
      email: user.email || "",
      name: userName,
      role: "ADMIN",
      grantedAt: Date.now(),
      grantedBy: "self-grant", // Marker for self-granted access
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin access granted successfully",
      access: {
        uid: user.uid,
        email: user.email,
        role: "ADMIN",
      },
    });
  } catch (error: any) {
    console.error("Error granting admin access:", error);
    return NextResponse.json(
      { error: error.message || "Failed to grant admin access" },
      { status: 500 }
    );
  }
}
