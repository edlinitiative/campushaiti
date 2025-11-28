/**
 * University Permissions API
 * Returns the current user's role and permissions for a university
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ROLE_PERMISSIONS, UniversityRole } from "@/lib/types/uni";

export async function GET(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Get session cookie
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No session cookie found" },
        { status: 401 }
      );
    }

    // Verify session
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Get university ID from query params or subdomain
    const { searchParams } = new URL(request.url);
    let universityId = searchParams.get("universityId");

    // If no universityId, try to get from subdomain
    if (!universityId) {
      const schoolSlug = request.headers.get("x-school-slug");
      if (schoolSlug) {
        const universitiesSnapshot = await db
          .collection("universities")
          .where("slug", "==", schoolSlug)
          .limit(1)
          .get();

        if (!universitiesSnapshot.empty) {
          universityId = universitiesSnapshot.docs[0].id;
        }
      }
    }

    if (!universityId) {
      return NextResponse.json(
        { error: "University ID not found" },
        { status: 400 }
      );
    }

    // Check if platform admin
    if (decodedClaims.role === "ADMIN") {
      return NextResponse.json({
        role: "UNI_ADMIN" as UniversityRole,
        permissions: ROLE_PERMISSIONS.UNI_ADMIN,
        isPlatformAdmin: true,
      });
    }

    // Check if in adminUids array (legacy check)
    const universityDoc = await db.collection("universities").doc(universityId).get();
    const universityData = universityDoc.data();

    if (universityData?.adminUids?.includes(userId)) {
      return NextResponse.json({
        role: "UNI_ADMIN" as UniversityRole,
        permissions: ROLE_PERMISSIONS.UNI_ADMIN,
        isLegacyAdmin: true,
      });
    }

    // Check staff subcollection for granular role
    const staffDoc = await db
      .collection("universities")
      .doc(universityId)
      .collection("staff")
      .doc(userId)
      .get();

    if (staffDoc.exists) {
      const staffData = staffDoc.data();
      const role = staffData?.role as UniversityRole;
      const permissions = ROLE_PERMISSIONS[role] || [];

      return NextResponse.json({
        role,
        permissions,
        isStaff: true,
      });
    }

    // No access
    return NextResponse.json(
      { error: "Unauthorized - not a staff member" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
