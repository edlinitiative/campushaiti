import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/universities
 * Get all universities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    // Verify user is authenticated and is an admin
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = db.collection("universities");

    // Filter by status if provided
    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    let universities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Search filter (client-side since Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      universities = universities.filter((uni: any) =>
        uni.name?.toLowerCase().includes(searchLower) ||
        uni.city?.toLowerCase().includes(searchLower) ||
        uni.email?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/universities
 * Create a new university
 */
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    // Verify user is authenticated and is an admin
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, slug, city, country, contactEmail, contactPhone, websiteUrl, description } = body;

    // Validate required fields
    if (!name || !slug || !city || !country || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingUniversity = await db.collection("universities")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existingUniversity.empty) {
      return NextResponse.json(
        { error: "A university with this slug already exists" },
        { status: 400 }
      );
    }

    // Create university document
    const universityId = `uni_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const universityRef = db.collection("universities").doc(universityId);
    
    const now = new Date();
    await universityRef.set({
      name,
      slug,
      city,
      country,
      contactEmail,
      contactPhone: contactPhone || "",
      websiteUrl: websiteUrl || "",
      description: description || "",
      status: "APPROVED",
      adminUids: [],
      createdAt: now,
      updatedAt: now,
      approvedAt: now,
      approvedBy: user.uid,
    });

    return NextResponse.json({
      success: true,
      universityId,
      message: "University created successfully",
    });
  } catch (error) {
    console.error("Error creating university:", error);
    return NextResponse.json(
      { error: "Failed to create university" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/universities/:id
 * Update university (handled in separate [id]/route.ts if needed)
 */

/**
 * DELETE /api/admin/universities/:id
 * Delete university (handled in separate [id]/route.ts if needed)
 */
