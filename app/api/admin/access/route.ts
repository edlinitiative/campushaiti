import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/access
 * List all admin users and their access levels
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Check if current user has adminAccess document, if not create it
    const currentUserAccess = await db.collection("adminAccess").doc(user.uid).get();
    if (!currentUserAccess.exists) {
      console.log("Creating adminAccess document for existing admin:", user.email);
      
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
      
      await db.collection("adminAccess").doc(user.uid).set({
        uid: user.uid,
        email: user.email || "",
        name: userName,
        role: "ADMIN",
        grantedAt: Date.now(),
        grantedBy: "auto-created",
        createdAt: Date.now(),
      });
    }

    const adminAccessSnapshot = await db
      .collection("adminAccess")
      .orderBy("grantedAt", "desc")
      .get();

    const admins = adminAccessSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("Error fetching admin access:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin access" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/access
 * Update an admin's access level (VIEWER -> ADMIN or ADMIN -> VIEWER)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();

    // Only ADMINs with full access can upgrade others
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    // Check if current user has ADMIN role (not just VIEWER)
    const currentUserAccess = await db.collection("adminAccess").doc(user.uid).get();
    const currentUserData = currentUserAccess.data();

    if (!currentUserData || currentUserData.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators with full access can upgrade access levels" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    if (role !== "VIEWER" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Invalid role. Must be VIEWER or ADMIN" },
        { status: 400 }
      );
    }

    // Can't change own access level
    if (uid === user.uid) {
      return NextResponse.json(
        { error: "You cannot change your own access level" },
        { status: 400 }
      );
    }

    // Update access level
    await db.collection("adminAccess").doc(uid).update({
      role,
      updatedAt: Date.now(),
      updatedBy: user.uid,
    });

    return NextResponse.json({
      success: true,
      message: `Access level updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating admin access:", error);
    return NextResponse.json(
      { error: "Failed to update admin access" },
      { status: 500 }
    );
  }
}
