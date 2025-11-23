import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PUT /api/schools/programs/:id
 * Update a program
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
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const programId = params.id;
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
    const { name, degree, description, requirements, feeCents, currency, deadline } = body;

    // Build update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (name) updates.name = name;
    if (degree) updates.degree = degree;
    if (description !== undefined) updates.description = description;
    if (requirements !== undefined) updates.requirements = requirements;
    if (feeCents !== undefined) updates.feeCents = parseInt(feeCents);
    if (currency) updates.currency = currency;
    if (deadline) updates.deadline = new Date(deadline).getTime();

    await programRef.update(updates);

    return NextResponse.json({
      success: true,
      message: "Program updated successfully",
    });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schools/programs/:id
 * Delete a program (soft delete)
 */
export async function DELETE(
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
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const programId = params.id;
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

    // Check if program has applications
    const applicationsSnapshot = await db.collection("applicationItems")
      .where("programId", "==", programId)
      .limit(1)
      .get();

    if (!applicationsSnapshot.empty) {
      // Soft delete - mark as inactive instead of removing
      await programRef.update({
        isActive: false,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });

      return NextResponse.json({
        success: true,
        message: "Program marked as inactive (has existing applications)",
      });
    } else {
      // Hard delete if no applications
      await programRef.delete();

      return NextResponse.json({
        success: true,
        message: "Program deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
