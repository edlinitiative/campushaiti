import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/service";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/invite
 * Invite someone to become a platform administrator (starts as VIEWER)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();

    // Only existing ADMINs can invite new admins
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Check if already invited
    const existingInvite = await db
      .collection("adminInvitations")
      .where("email", "==", email)
      .where("status", "==", "PENDING")
      .limit(1)
      .get();

    if (!existingInvite.empty) {
      return NextResponse.json(
        { error: "This email already has a pending invitation" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create invitation
    const invitation = {
      email,
      invitedBy: user.uid,
      invitedByName: user.email || "Admin",
      createdAt: Date.now(),
      expiresAt,
      status: "PENDING",
      token,
    };

    const invitationRef = await db.collection("adminInvitations").add(invitation);

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://campus.ht"}/admin/accept-invite?token=${token}`;
    
    console.log("Sending admin invitation email to:", email);
    console.log("Invite URL:", inviteUrl);
    
    const emailSent = await sendEmail({
      to: email,
      subject: "You've been invited to join Campus Haiti as an Administrator",
      text: `You've been invited by ${user.email} to join Campus Haiti as a platform administrator. Accept your invitation here: ${inviteUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Platform Administrator Invitation</h2>
          <p>You've been invited by <strong>${user.email}</strong> to join Campus Haiti as a platform administrator.</p>
          
          <p>As an administrator, you will start with <strong>VIEWER</strong> access, which allows you to:</p>
          <ul>
            <li>View all platform data and statistics</li>
            <li>Access admin dashboard and reports</li>
            <li>Monitor platform activity</li>
          </ul>
          
          <p>An existing administrator can upgrade your access level if needed.</p>
          
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });
    
    if (!emailSent) {
      console.error("Failed to send invitation email to:", email);
      console.error("Email provider configured:", process.env.SENDGRID_API_KEY ? "SendGrid" : process.env.SMTP_HOST ? "SMTP" : "None");
      // Delete the invitation since email failed
      await invitationRef.delete();
      return NextResponse.json(
        { error: "Failed to send invitation email. Please check email configuration." },
        { status: 500 }
      );
    }
    
    console.log("Admin invitation email sent successfully to:", email);

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      invitationId: invitationRef.id,
      expiresAt,
    });
  } catch (error) {
    console.error("Error sending admin invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/invite
 * List all pending admin invitations
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();

    const invitationsSnapshot = await db
      .collection("adminInvitations")
      .where("status", "==", "PENDING")
      .orderBy("createdAt", "desc")
      .get();

    const invitations = invitationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching admin invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/invite?id=invitationId
 * Cancel/delete a pending invitation
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("adminInvitations").doc(invitationId).delete();

    return NextResponse.json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
