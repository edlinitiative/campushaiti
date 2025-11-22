import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendUniversityRejectedEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PUT /api/admin/registrations/:id/reject
 * Reject a university registration
 */


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is admin
    if (decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const registrationId = params.id;
    const registrationRef = db.collection("universityRegistrations").doc(registrationId);
    const registrationDoc = await registrationRef.get();

    if (!registrationDoc.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Update registration status
    await registrationRef.update({
      status: "REJECTED",
      reviewedAt: Date.now(),
      reviewedBy: decodedClaims.uid,
      rejectionReason: reason,
    });

    const registration = registrationDoc.data();
    
    // Send rejection email
    await sendUniversityRejectedEmail({
      universityName: registration!.universityName,
      contactName: registration!.contactPersonName,
      email: registration!.contactPersonEmail,
      reason,
    });

    // TODO: Send rejection notification email to contact person with reason

    return NextResponse.json({
      success: true,
      message: "University registration rejected",
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return NextResponse.json(
      { error: "Failed to reject registration" },
      { status: 500 }
    );
  }
}
