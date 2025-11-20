import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is an admin
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    
    // Get counts from Firestore
    const [universitiesSnap, programsSnap, applicationsSnap, usersSnap] = await Promise.all([
      db.collection("universities").get(),
      db.collection("programs").get(),
      db.collection("applicationItems").get(),
      db.collection("users").get(),
    ]);

    // Get pending universities
    const pendingUniversities = universitiesSnap.docs.filter(
      (doc: any) => doc.data().status === "PENDING"
    ).length;

    // Get application stats
    const applications = applicationsSnap.docs.map((doc: any) => doc.data());
    const pendingApps = applications.filter((app: any) => app.status === "SUBMITTED").length;
    const underReviewApps = applications.filter((app: any) => app.status === "UNDER_REVIEW").length;
    const acceptedApps = applications.filter((app: any) => app.status === "ACCEPTED").length;

    const stats = {
      totalUniversities: universitiesSnap.size,
      pendingUniversities,
      approvedUniversities: universitiesSnap.docs.filter(
        (doc: any) => doc.data().status === "APPROVED"
      ).length,
      totalPrograms: programsSnap.size,
      totalApplications: applicationsSnap.size,
      pendingApplications: pendingApps,
      underReviewApplications: underReviewApps,
      acceptedApplications: acceptedApps,
      totalUsers: usersSnap.size,
      applicants: usersSnap.docs.filter((doc: any) => doc.data().role === "APPLICANT").length,
      schoolAdmins: usersSnap.docs.filter((doc: any) => doc.data().role === "SCHOOL_ADMIN").length,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
