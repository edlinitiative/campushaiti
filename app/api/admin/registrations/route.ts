import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { UniversityRegistration } from "@/lib/types/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/registrations
 * List all university registrations (optionally filtered by status)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is admin
    if (decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getAdminDb();

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = db.collection("universityRegistrations");
    
    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.orderBy("submittedAt", "desc").get();
    
    const registrations: UniversityRegistration[] = [];
    snapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() } as UniversityRegistration);
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
