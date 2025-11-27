import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/stats
 * Get dashboard statistics for school administrators
 */


export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      console.log('[Stats API] No session cookie found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    console.log('[Stats API] User authenticated:', { uid: decodedClaims.uid, role: decodedClaims.role });
    
    // Verify user is school admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      console.log('[Stats API] User role not authorized:', decodedClaims.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get school slug from subdomain
    const schoolSlug = request.headers.get('x-school-slug');
    console.log('[Stats API] School slug from header:', schoolSlug);
    
    if (!schoolSlug) {
      return NextResponse.json({
        applications: 0,
        newApplications: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        programs: 0,
      });
    }

    // Find university by slug
    const universitiesSnapshot = await db.collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({
        applications: 0,
        newApplications: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        programs: 0,
      });
    }
    
    // Verify user has access to this university
    const universityData = universitiesSnapshot.docs[0].data();
    console.log('[Stats API] University found:', {
      name: universityData.name,
      adminUids: universityData.adminUids,
      userUid: decodedClaims.uid,
      hasAccess: universityData.adminUids?.includes(decodedClaims.uid)
    });
    if (decodedClaims.role !== "ADMIN" && 
        !universityData.adminUids?.includes(decodedClaims.uid)) {
      console.log('[Stats API] User does not have access to this university');
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const universityIds = universitiesSnapshot.docs.map((doc) => doc.id);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get programs count
    let programsCount = 0;
    for (const universityId of universityIds) {
      const programsSnapshot = await db.collection("programs")
        .where("universityId", "==", universityId)
        .get();
      programsCount += programsSnapshot.size;
    }

    // Get applications statistics
    let applicationsQuery = db.collection("applicationItems");
    
    if (universityIds.length === 1) {
      applicationsQuery = applicationsQuery.where("universityId", "==", universityIds[0]) as any;
    } else {
      applicationsQuery = applicationsQuery.where("universityId", "in", universityIds) as any;
    }

    const applicationsSnapshot = await applicationsQuery.get();
    
    let totalApplications = 0;
    let newApplications = 0;
    let accepted = 0;
    let rejected = 0;
    let pending = 0;

    applicationsSnapshot.forEach((doc) => {
      const app = doc.data();
      totalApplications++;

      if (app.createdAt > sevenDaysAgo) {
        newApplications++;
      }

      switch (app.status) {
        case "ACCEPTED":
          accepted++;
          break;
        case "REJECTED":
          rejected++;
          break;
        case "PENDING":
        case "UNDER_REVIEW":
          pending++;
          break;
      }
    });

    return NextResponse.json({
      applications: totalApplications,
      newApplications,
      accepted,
      rejected,
      pending,
      programs: programsCount,
      acceptanceRate: totalApplications > 0 ? (accepted / totalApplications) * 100 : 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
