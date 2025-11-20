import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";
import { ApplicationItem } from "@/lib/types/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/applications
 * Get applications for schools the user administers
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    
    // Verify user is school admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const programId = searchParams.get("programId");

    // Find universities where user is an admin
    const universitiesSnapshot = await collection("universities")
      .where("adminUids", "array-contains", decodedClaims.uid)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ applications: [] });
    }

    const universityIds = universitiesSnapshot.docs.map((doc) => doc.id);

    // Build query for applications
    let query = collection("applicationItems");

    // Filter by university
    if (universityIds.length === 1) {
      query = query.where("universityId", "==", universityIds[0]) as any;
    } else {
      query = query.where("universityId", "in", universityIds) as any;
    }

    // Apply additional filters
    if (status) {
      query = query.where("status", "==", status) as any;
    }

    if (programId) {
      query = query.where("programId", "==", programId) as any;
    }

    const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();

    const applications: ApplicationItem[] = [];
    snapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as ApplicationItem);
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
