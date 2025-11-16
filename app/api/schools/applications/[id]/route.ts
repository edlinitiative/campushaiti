import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/applications/:id
 * Fetch a single application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applicationId = params.id;
    const applicationRef = adminDb.collection("applicationItems").doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = applicationDoc.data();

    // Verify user has access to this application's university
    if (decodedClaims.role === "SCHOOL_ADMIN") {
      const universityRef = adminDb.collection("universities").doc(application!.universityId);
      const universityDoc = await universityRef.get();
      
      if (!universityDoc.exists) {
        return NextResponse.json({ error: "University not found" }, { status: 404 });
      }

      const university = universityDoc.data();
      if (!university!.adminUids || !university!.adminUids.includes(decodedClaims.uid)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({
      application: { id: applicationDoc.id, ...application },
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schools/applications/:id
 * Update application status and review information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applicationId = params.id;
    const applicationRef = adminDb.collection("applicationItems").doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = applicationDoc.data();

    // Verify user has access to this application's university
    if (decodedClaims.role === "SCHOOL_ADMIN") {
      const universityRef = adminDb.collection("universities").doc(application!.universityId);
      const universityDoc = await universityRef.get();
      
      if (!universityDoc.exists) {
        return NextResponse.json({ error: "University not found" }, { status: 404 });
      }

      const university = universityDoc.data();
      if (!university!.adminUids || !university!.adminUids.includes(decodedClaims.uid)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (status) {
      updateData.status = status;
    }

    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes;
      updateData.reviewedBy = decodedClaims.uid;
      updateData.reviewedAt = Date.now();
    }

    await applicationRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
