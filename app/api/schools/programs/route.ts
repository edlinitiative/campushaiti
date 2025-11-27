import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/schools/programs
 * Get programs for the authenticated school admin's university
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      console.log('[Programs API] No session cookie found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    console.log('[Programs API] User authenticated:', { uid: decodedClaims.uid, role: decodedClaims.role });
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      console.log('[Programs API] User role not authorized:', decodedClaims.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get school slug from subdomain
    const schoolSlug = request.headers.get('x-school-slug');
    console.log('[Programs API] School slug from header:', schoolSlug);
    
    if (!schoolSlug) {
      return NextResponse.json({ programs: [] });
    }

    // Find university by slug
    const universitiesSnapshot = await db.collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ programs: [] });
    }
    
    // Verify user has access to this university
    const universityData = universitiesSnapshot.docs[0].data();
    console.log('[Programs API] University found:', { 
      name: universityData.name, 
      adminUids: universityData.adminUids,
      userUid: decodedClaims.uid,
      hasAccess: universityData.adminUids?.includes(decodedClaims.uid)
    });
    if (decodedClaims.role !== "ADMIN" && 
        !universityData.adminUids?.includes(decodedClaims.uid)) {
      console.log('[Programs API] User does not have access to this university');
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const universityIds = universitiesSnapshot.docs.map((doc) => doc.id);

    // Get programs for these universities
    let query = db.collection("programs");

    if (universityIds.length === 1) {
      query = query.where("universityId", "==", universityIds[0]) as any;
    } else {
      query = query.where("universityId", "in", universityIds) as any;
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    const programs: any[] = [];
    snapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    const user = await getServerUser();
    
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, degree, description, requirements, feeCents, currency, deadline } = body;

    if (!name || !degree || !description || !requirements || feeCents === undefined || !currency || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user's university
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.universityId) {
      return NextResponse.json(
        { error: "No university associated with your account" },
        { status: 400 }
      );
    }

    // Create the program
    const programId = `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const programRef = db.collection("programs").doc(programId);
    const now = Date.now();

    await programRef.set({
      universityId: userData.universityId,
      name,
      degree,
      description,
      requirements,
      feeCents: parseInt(feeCents),
      currency,
      deadline: new Date(deadline).getTime(),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      programId: programId,
    });
  } catch (error: any) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
