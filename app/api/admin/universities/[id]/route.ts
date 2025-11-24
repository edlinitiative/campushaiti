import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/universities/:id
 * Update an existing university
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, slug, city, country, contactEmail, contactPhone, websiteUrl, description } = body;

    // Validate required fields
    if (!name || !slug || !city || !country || !contactEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current university)
    const existingUniversity = await db.collection("universities")
      .where("slug", "==", slug)
      .limit(2)
      .get();

    const duplicateSlug = existingUniversity.docs.find(doc => doc.id !== id);
    if (duplicateSlug) {
      return NextResponse.json(
        { error: "A university with this slug already exists" },
        { status: 400 }
      );
    }

    // Update university document
    await db.collection("universities").doc(id).update({
      name,
      slug,
      city,
      country,
      contactEmail,
      contactPhone: contactPhone || "",
      websiteUrl: websiteUrl || "",
      description: description || "",
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "University updated successfully",
    });
  } catch (error) {
    console.error("Error updating university:", error);
    return NextResponse.json(
      { error: "Failed to update university" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/universities/:id
 * Delete a university
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if university has programs
    const programsSnapshot = await db.collection("programs")
      .where("universityId", "==", id)
      .limit(1)
      .get();

    if (!programsSnapshot.empty) {
      return NextResponse.json(
        { error: "Cannot delete university with existing programs. Delete programs first." },
        { status: 400 }
      );
    }

    // Check if university has active applications
    const applicationsSnapshot = await db.collection("applicationItems")
      .where("universityId", "==", id)
      .limit(1)
      .get();

    if (!applicationsSnapshot.empty) {
      return NextResponse.json(
        { error: "Cannot delete university with existing applications." },
        { status: 400 }
      );
    }

    // Delete university
    await db.collection("universities").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "University deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting university:", error);
    return NextResponse.json(
      { error: "Failed to delete university" },
      { status: 500 }
    );
  }
}
