import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/invite/resend
 * Resend an admin invitation email
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId } = body;

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    console.log("=== RESENDING ADMIN INVITATION ===");
    console.log("Invitation ID:", invitationId);
    console.log("Requested by:", user.email);

    // Get the invitation
    const invitationDoc = await db.collection("adminInvitations").doc(invitationId).get();

    if (!invitationDoc.exists) {
      console.error("Invitation not found:", invitationId);
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const invitation = invitationDoc.data();

    console.log("Invitation status:", invitation?.status);
    console.log("Invitation email:", invitation?.email);

    if (invitation?.status !== "PENDING") {
      console.error("Cannot resend non-pending invitation. Status:", invitation?.status);
      return NextResponse.json(
        { error: "Can only resend pending invitations" },
        { status: 400 }
      );
    }

    // Check if expired
    if (invitation.expiresAt < Date.now()) {
      console.error("Invitation has expired. Expires at:", invitation.expiresAt);
      return NextResponse.json(
        { error: "Invitation has expired. Please create a new one." },
        { status: 400 }
      );
    }

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://campus.ht"}/admin/accept-invite?token=${invitation.token}`;

    console.log("Resending admin invitation email to:", invitation.email);
    console.log("Invite URL:", inviteUrl);

    const emailSent = await sendEmail({
      to: invitation.email,
      subject: "Reminder: You've been invited to join Campus Haiti as an Administrator",
      text: `You've been invited by ${invitation.invitedByName} to join Campus Haiti as a platform administrator. Accept your invitation here: ${inviteUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Platform Administrator Invitation Reminder</h2>
          <p>This is a reminder that you've been invited by <strong>${invitation.invitedByName}</strong> to join Campus Haiti as a platform administrator.</p>
          
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
          
          <p style="color: #666; font-size: 14px;">This invitation expires on ${new Date(invitation.expiresAt).toLocaleDateString()}.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (!emailSent) {
      console.error("Failed to resend invitation email to:", invitation.email);
      console.error("Email provider configured:", process.env.SENDGRID_API_KEY ? "SendGrid" : process.env.SMTP_HOST ? "SMTP" : "None");
      return NextResponse.json(
        { error: "Failed to send email. Please check email configuration." },
        { status: 500 }
      );
    }

    console.log("Admin invitation email resent successfully to:", invitation.email);

    // Update last sent timestamp
    await db.collection("adminInvitations").doc(invitationId).update({
      lastSentAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Invitation resent to ${invitation.email}`,
    });
  } catch (error) {
    console.error("Error resending admin invitation:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
}
