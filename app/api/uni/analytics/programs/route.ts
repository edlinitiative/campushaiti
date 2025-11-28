/**
 * Program Stats API
 * GET /api/uni/analytics/programs
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await auth.verifySessionCookie(sessionCookie, true);

    const schoolSlug = request.headers.get("x-school-slug");
    if (!schoolSlug) {
      return NextResponse.json({ error: "School not found" }, { status: 400 });
    }

    const universitiesSnapshot = await db
      .collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const universityId = universitiesSnapshot.docs[0].id;

    // Get programs
    const programsSnapshot = await db
      .collection("programs")
      .where("universityId", "==", universityId)
      .get();

    const programs = programsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));

    // Get applications
    const applicationsSnapshot = await db
      .collection("applicationItems")
      .where("universityId", "==", universityId)
      .get();

    // Calculate stats per program
    const programStats = programs.map((program) => {
      const programApps = applicationsSnapshot.docs.filter(
        (doc) => doc.data().programId === program.id
      );

      const applications = programApps.length;
      const accepted = programApps.filter(
        (doc) => doc.data().status === "accepted"
      ).length;
      const rejected = programApps.filter(
        (doc) => doc.data().status === "rejected"
      ).length;
      const totalDecided = accepted + rejected;
      const acceptanceRate =
        totalDecided > 0 ? (accepted / totalDecided) * 100 : 0;

      return {
        programId: program.id,
        programName: program.name,
        applications,
        accepted,
        rejected,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      };
    });

    // Sort by application count
    programStats.sort((a, b) => b.applications - a.applications);

    return NextResponse.json({ programs: programStats });
  } catch (error) {
    console.error("Error fetching program analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
