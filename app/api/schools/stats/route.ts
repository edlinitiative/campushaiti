import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/stats
 * Get dashboard statistics for school administrators
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

    // Find universities where user is an admin
    const universitiesSnapshot = await collection("universities")
      .where("adminUids", "array-contains", decodedClaims.uid)
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

    const universityIds = universitiesSnapshot.docs.map((doc) => doc.id);
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Get programs count
    let programsCount = 0;
    for (const universityId of universityIds) {
      const programsSnapshot = await collection("programs")
        .where("universityId", "==", universityId)
        .get();
      programsCount += programsSnapshot.size;
    }

    // Get applications statistics
    let applicationsQuery = collection("applicationItems");
    
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
