import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendUniversityApprovedEmail, sendNewRegistrationNotification } from "@/lib/email/service";
import { University } from "@/lib/types/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PUT /api/admin/registrations/:id/approve
 * Approve a university registration
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

    const registrationId = params.id;
    const registrationRef = db.collection("universityRegistrations").doc(registrationId);
    const registrationDoc = await registrationRef.get();

    if (!registrationDoc.exists) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = registrationDoc.data();

    // Create slug from university name
    const slug = registration!.universityName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create the university document
    const universityData: any = {
      name: registration!.universityName,
      slug,
      description: registration!.description,
      city: registration!.city,
      country: registration!.country,
      website: registration!.website,
      email: registration!.email,
      phone: registration!.phone,
      status: "APPROVED",
      adminUids: [], // Will be populated when admin user is created
      createdAt: Date.now(),
      updatedAt: Date.now(),
      approvedAt: Date.now(),
      approvedBy: decodedClaims.uid,
    };

    const universityRef = await db.collection("universities").add(universityData);
    const universityId = universityRef.path.split('/').pop()!;

    // Create school admin user account
    const contactEmail = registration!.contactPersonEmail;
    const contactName = registration!.contactPersonName;
    
    // Generate temporary password
    const tempPassword = `CampusHaiti${Math.random().toString(36).slice(2, 10)}!`;
    
    let schoolAdminUid: string | null = null;
    
    try {
      // Check if user already exists
      let userRecord;
      try {
        userRecord = await getAdminAuth().getUserByEmail(contactEmail);
        schoolAdminUid = userRecord.uid;
        
        // Update existing user's role to SCHOOL_ADMIN
        await getAdminAuth().setCustomUserClaims(userRecord.uid, { role: "SCHOOL_ADMIN" });
      } catch (getUserError: any) {
        if (getUserError.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await getAdminAuth().createUser({
            email: contactEmail,
            password: tempPassword,
            displayName: contactName,
            emailVerified: false,
          });
          
          schoolAdminUid = userRecord.uid;
          
          // Set custom claims
          await getAdminAuth().setCustomUserClaims(userRecord.uid, { role: "SCHOOL_ADMIN" });
          
          // TODO: Send welcome email with temporary password
          console.log(`Created school admin account for ${contactEmail} with temp password: ${tempPassword}`);
        } else {
          throw getUserError;
        }
      }
      
      // Add user to university's adminUids
      await universityRef.update({
        adminUids: [schoolAdminUid],
      });
      
    } catch (authError) {
      console.error("Error creating school admin user:", authError);
      // Don't fail the entire approval if user creation fails
      // The admin can manually create the user later
    }

    // Update registration status
    await registrationRef.update({
      status: "APPROVED",
      reviewedAt: Date.now(),
      reviewedBy: decodedClaims.uid,
      universityId: universityId,
    });

    // Send approval email with subdomain URL
    await sendUniversityApprovedEmail({
      universityName: registration!.universityName,
      contactName: registration!.contactPersonName,
      email: registration!.contactPersonEmail,
      tempPassword: schoolAdminUid && tempPassword ? tempPassword : undefined,
      universitySlug: slug, // Pass the slug for subdomain URL
    });

    // TODO: Create school admin user account and send invitation email
    // TODO: Send approval notification email to contact person

    return NextResponse.json({
      success: true,
      universityId: universityRef.path.split('/').pop() || '',
      message: "University approved successfully",
    });
  } catch (error) {
    console.error("Error approving registration:", error);
    return NextResponse.json(
      { error: "Failed to approve registration" },
      { status: 500 }
    );
  }
}
