/**
 * Application Funnel API
 * GET /api/uni/analytics/funnel
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ApplicationStatus } from "@/lib/types/uni";

const STATUS_ORDER: ApplicationStatus[] = [
  "new",
  "in_review",
  "missing_docs",
  "interview",
  "accepted",
  "rejected",
];

export async function GET(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

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

    // Check permissions
    if (decodedClaims.role !== "ADMIN") {
      const universityData = universitiesSnapshot.docs[0].data();
      const isLegacyAdmin = universityData.adminUids?.includes(userId);

      if (!isLegacyAdmin) {
        const staffDoc = await db
          .collection("universities")
          .doc(universityId)
          .collection("staff")
          .doc(userId)
          .get();

        if (!staffDoc.exists) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    // Get applications
    const applicationsSnapshot = await db
      .collection("applicationItems")
      .where("universityId", "==", universityId)
      .get();

    const total = applicationsSnapshot.size;

    // Count by status
    const funnel = STATUS_ORDER.map((status) => {
      const count = applicationsSnapshot.docs.filter(
        (doc) => doc.data().status === status
      ).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;

      return {
        status,
        count,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error("Error fetching funnel analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
