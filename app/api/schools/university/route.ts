import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/university
 * Get university data for the authenticated school admin
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

    // Find universities where user is an admin
    const universitiesSnapshot = await db.collection("universities")
      .where("adminUids", "array-contains", decodedClaims.uid)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json(
        { error: "No university found for this user" },
        { status: 404 }
      );
    }

    const universityDoc = universitiesSnapshot.docs[0];
    const university = {
      id: universityDoc.id,
      ...universityDoc.data(),
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
