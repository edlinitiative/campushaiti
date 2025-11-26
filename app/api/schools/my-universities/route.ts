import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/my-universities
 * Get all universities the authenticated user has access to
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or platform admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Platform admins have access to all universities
    if (decodedClaims.role === "ADMIN") {
      const universitiesSnapshot = await db.collection("universities").get();
      
      const universities = universitiesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          city: doc.data().city,
          country: doc.data().country,
        }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      return NextResponse.json({ universities });
    }

    // School admins: find universities where user is in adminUids
    const universitiesSnapshot = await db.collection("universities")
      .where("adminUids", "array-contains", decodedClaims.uid)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json(
        { error: "No universities found for this user" },
        { status: 404 }
      );
    }

    const universities = universitiesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
        city: doc.data().city,
        country: doc.data().country,
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
