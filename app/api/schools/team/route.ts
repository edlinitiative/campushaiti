import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { TeamRole } from "@/lib/types/firestore";
import { sendTeamInvitationEmail } from "@/lib/email/service";
import { getSchoolSubdomainUrl } from "@/lib/utils/subdomain";

export const dynamic = "force-dynamic";

/**
 * GET /api/schools/team
 * Get all team members for the school
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();

    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Return team members
    const team = university.team || {};
    const teamMembers = Object.values(team);

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools/team/invite
 * Invite a new team member
 */
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const user = await getServerUser();

    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role } = body as { email: string; role: TeamRole };

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["OWNER", "ADMIN", "VIEWER"].includes(role)) {
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
    const universityId = universityDoc.id;
    
    // Verify user has access
    if (user.role !== "ADMIN" && !university.adminUids?.includes(user.uid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user has permission to invite (must be OWNER or ADMIN)
    const currentUserRole = university.team?.[user.uid]?.role || "OWNER";
    if (currentUserRole === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers cannot invite team members" },
        { status: 403 }
      );
    }

    // Check if email is already a team member
    const existingMember = Object.values(university.team || {}).find(
      (member: any) => member.email === email
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "This email is already a team member" },
        { status: 400 }
      );
    }

    // Create invitation token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create invitation document
    await db.collection("teamInvitations").add({
      universityId,
      universityName: university.name,
      email,
      role,
      invitedBy: user.uid,
      invitedByName: user.email,
      status: "PENDING",
      token,
      createdAt: Date.now(),
      expiresAt,
    });

    // Send invitation email - use school subdomain for better UX
    const inviteUrl = getSchoolSubdomainUrl(university.slug, `/team/accept?token=${token}`);
    
    await sendTeamInvitationEmail({
      email,
      inviterName: user.email || "Admin",
      universityName: university.name,
      role,
      inviteUrl,
      expiresInDays: 7,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
