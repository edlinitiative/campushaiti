import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/schools/team/[userId]
 * Remove a team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();

    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    // Get school slug from subdomain
    const schoolSlug = request.headers.get('x-school-slug');
    
    if (!schoolSlug) {
      return NextResponse.json({ error: "No school subdomain" }, { status: 400 });
    }

    // Find university by slug
    const universitiesSnapshot = await db
      .collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const universityDoc = universitiesSnapshot.docs[0];
    const university = universityDoc.data();
    
    // Verify user has access
    if (user.role !== "ADMIN" && !university.adminUids?.includes(user.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if current user has permission (must be OWNER or ADMIN)
    const currentUserRole = university.team?.[user.uid]?.role || "OWNER";
    if (currentUserRole === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers cannot remove team members" },
        { status: 403 }
      );
    }

    // Prevent removing yourself
    if (userId === user.uid) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Check if trying to remove an OWNER (only OWNER can remove OWNER)
    const targetMember = university.team?.[userId];
    if (targetMember?.role === "OWNER" && currentUserRole !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can remove other owners" },
        { status: 403 }
      );
    }

    // Remove from team object
    const updateData: any = {
      [`team.${userId}`]: null,
      updatedAt: Date.now(),
    };

    // Also remove from adminUids array
    const newAdminUids = (university.adminUids || []).filter(
      (uid: string) => uid !== userId
    );
    updateData.adminUids = newAdminUids;

    await universityDoc.ref.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/schools/team/[userId]
 * Update team member role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();

    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["OWNER", "ADMIN", "VIEWER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get school slug from subdomain
    const schoolSlug = request.headers.get('x-school-slug');
    
    if (!schoolSlug) {
      return NextResponse.json({ error: "No school subdomain" }, { status: 400 });
    }

    // Find university by slug
    const universitiesSnapshot = await db
      .collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const universityDoc = universitiesSnapshot.docs[0];
    const university = universityDoc.data();
    
    // Verify user has access
    if (user.role !== "ADMIN" && !university.adminUids?.includes(user.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if current user has permission (must be OWNER)
    const currentUserRole = university.team?.[user.uid]?.role || "OWNER";
    if (currentUserRole !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can change team member roles" },
        { status: 403 }
      );
    }

    // Prevent changing your own role
    if (userId === user.uid) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const targetMember = university.team?.[userId];
    if (!targetMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Update role
    await universityDoc.ref.update({
      [`team.${userId}.role`]: role,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Team member role updated successfully",
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}
