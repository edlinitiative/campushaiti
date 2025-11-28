/**
 * Analytics Overview API
 * GET /api/uni/analytics/overview
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

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Get university ID from header
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

    // Get all applications
    const applicationsSnapshot = await db
      .collection("applicationItems")
      .where("universityId", "==", universityId)
      .get();

    const applications = applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate KPIs
    const totalApplications = applications.length;
    const newApplications = applications.filter((app: any) => app.status === "new").length;
    const inReview = applications.filter((app: any) => app.status === "in_review").length;
    const accepted = applications.filter((app: any) => app.status === "accepted").length;
    const rejected = applications.filter((app: any) => app.status === "rejected").length;

    const totalDecided = accepted + rejected;
    const acceptanceRate = totalDecided > 0 ? (accepted / totalDecided) * 100 : 0;

    // Calculate average processing time
    const decidedApps = applications.filter(
      (app: any) => app.decidedAt && app.createdAt
    );
    const avgProcessingMs =
      decidedApps.length > 0
        ? decidedApps.reduce((sum: number, app: any) => {
            const start = app.createdAt.toMillis ? app.createdAt.toMillis() : new Date(app.createdAt).getTime();
            const end = app.decidedAt.toMillis ? app.decidedAt.toMillis() : new Date(app.decidedAt).getTime();
            return sum + (end - start);
          }, 0) / decidedApps.length
        : 0;
    const averageProcessingDays = Math.round(avgProcessingMs / (1000 * 60 * 60 * 24));

    // Get payment totals
    const paymentsSnapshot = await db
      .collection("payments")
      .where("universityId", "==", universityId)
      .get();

    const payments = paymentsSnapshot.docs.map((doc) => doc.data());
    const totalRevenue = payments
      .filter((p: any) => p.status === "paid")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pendingPayments = payments.filter((p: any) => p.status === "pending").length;

    return NextResponse.json({
      totalApplications,
      newApplications,
      inReview,
      accepted,
      rejected,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      averageProcessingDays,
      totalRevenue,
      pendingPayments,
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
