import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";
import { CustomQuestion } from "@/lib/types/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/schools/questions/:programId
 * Get custom questions for a program
 */


export async function GET(
  request: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const db = getAdminDb();

    const programId = params.programId;
    const programRef = db.collection("programs").doc(programId);
    const programDoc = await programRef.get();

    if (!programDoc.exists) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = programDoc.data();
    const questions = program!.customQuestions || [];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools/questions/:programId
 * Save custom questions for a program
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const programId = params.programId;
    const programRef = db.collection("programs").doc(programId);
    const programDoc = await programRef.get();

    if (!programDoc.exists) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = programDoc.data();

    // Verify user has access to this program's university
    if (decodedClaims.role === "SCHOOL_ADMIN") {
      const universityRef = db.collection("universities").doc(program!.universityId);
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
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Questions must be an array" },
        { status: 400 }
      );
    }

    // Validate questions structure
    for (const question of questions) {
      if (!question.question || !question.type) {
        return NextResponse.json(
          { error: "Invalid question structure" },
          { status: 400 }
        );
      }
    }

    await programRef.update({
      customQuestions: questions,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Questions saved successfully",
    });
  } catch (error) {
    console.error("Error saving questions:", error);
    return NextResponse.json(
      { error: "Failed to save questions" },
      { status: 500 }
    );
  }
}
