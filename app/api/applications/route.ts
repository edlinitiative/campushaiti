import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";

/**
 * POST /api/applications
 * Submit a new application with multiple program items
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifySessionCookie(session);
    } catch (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationData } = body;

    if (!applicationData || !applicationData.programs || applicationData.programs.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid application data" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const uid = decodedToken.uid;

    // Create parent application
    const applicationRef = await db.collection("applications").add({
      applicantUid: uid,
      status: "SUBMITTED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create application items for each selected program
    const applicationItems = [];
    for (const program of applicationData.programs) {
      const itemData: any = {
        // Application reference
        applicationId: applicationRef.id,
        programId: program.id,
        
        // University/Program info (denormalized)
        universityId: program.universityId || 'unknown',
        universityName: program.universityName || 'Unknown University',
        programName: program.name,
        programDegree: program.degree || '',
        
        // Applicant info (denormalized)
        applicantUid: uid,
        applicantName: applicationData.user.name,
        applicantEmail: applicationData.user.email,
        applicantPhone: applicationData.user.phone,
        
        // Profile data
        personalStatement: applicationData.profile.personalStatement,
        nationality: applicationData.profile.nationality,
        birthDate: applicationData.profile.birthDate,
        
        // Education
        education: applicationData.profile.education,
        
        // Documents
        documentIds: applicationData.documents,
        
        // Status
        status: "SUBMITTED",
        checklist: {
          profileComplete: true,
          documentsUploaded: applicationData.documents.length > 0,
          essaysSubmitted: !!applicationData.profile.personalStatement,
          customQuestionsAnswered: !!(program.answers && Object.keys(program.answers).length > 0),
          paymentReceived: false, // Will be updated by payment webhook
        },
        
        // Timestamps
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add program answers if they exist
      if (program.answers && Object.keys(program.answers).length > 0) {
        itemData.programAnswers = program.answers;
      }

      const itemRef = await db.collection("applicationItems").add(itemData);
      applicationItems.push({ id: itemRef.id, ...itemData });
    }

    return NextResponse.json({
      success: true,
      applicationId: applicationRef.id,
      applicationItems: applicationItems.map(item => item.id),
      message: "Application submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
