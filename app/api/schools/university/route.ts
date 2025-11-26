import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { getSchoolSlugFromHeaders } from "@/lib/utils/subdomain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/university
 * Get university data based on subdomain
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get school slug from subdomain (set by middleware)
    const schoolSlug = request.headers.get('x-school-slug');
    
    if (!schoolSlug) {
      return NextResponse.json(
        { error: "No school subdomain detected" },
        { status: 400 }
      );
    }

    // Find university by slug
    const universitiesSnapshot = await db.collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json(
        { error: "University not found for this subdomain" },
        { status: 404 }
      );
    }

    const universityDoc = universitiesSnapshot.docs[0];
    const universityData = universityDoc.data();
    
    // Verify user has permission to access this university
    if (decodedClaims.role !== "ADMIN" && 
        !universityData.adminUids?.includes(decodedClaims.uid)) {
      return NextResponse.json(
        { error: "You don't have access to this university" },
        { status: 403 }
      );
    }

    const university = {
      id: universityDoc.id,
      ...universityData,
    };

    return NextResponse.json({ university });
  } catch (error) {
    console.error("Error fetching university:", error);
    return NextResponse.json(
      { error: "Failed to fetch university data" },
      { status: 500 }
    );
  }
}
