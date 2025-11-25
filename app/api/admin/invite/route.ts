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

    // Check if already invited and cancel any existing pending invitations
    const existingInvite = await db
      .collection("adminInvitations")
      .where("email", "==", email)
      .where("status", "==", "PENDING")
      .limit(1)
      .get();

    if (!existingInvite.empty) {
      // Automatically cancel the old invitation and create a new one
      const oldInviteId = existingInvite.docs[0].id;
      await db.collection("adminInvitations").doc(oldInviteId).delete();
      console.log(`Automatically cancelled old pending invitation for ${email} (ID: ${oldInviteId})`);
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
    
    console.log("=== ADMIN INVITATION EMAIL ===");
    console.log("To:", email);
    console.log("Invited by:", user.email);
    console.log("Invite URL:", inviteUrl);
    console.log("Environment check:");
    console.log("  - RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Not set");
    console.log("  - SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Configured" : "❌ Not set");
    console.log("  - FROM_EMAIL:", process.env.FROM_EMAIL || "Using default");
    console.log("Attempting to send email...");
    
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
      console.warn("❌ Email delivery failed!");
      console.warn("Possible reasons:");
      console.warn("  1. No email provider configured (check environment variables)");
      console.warn("  2. API key is invalid");
      console.warn("  3. FROM_EMAIL domain not verified (for Resend)");
      console.warn("  4. Network/API error");
      console.warn("Invitation created successfully. Share the link manually with the user.");
    } else {
      console.log("✅ Email sent successfully!");
    }
    console.log("==============================");

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? `Invitation sent to ${email}` 
        : `Invitation created for ${email}. Email delivery failed - share the link manually.`,
      invitationId: invitationRef.id,
      expiresAt,
      emailSent,
      inviteUrl, // Include the URL in response for easy copying
    });
  } catch (error) {
    console.error("Error sending admin invitation:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to send invitation",
        details: error instanceof Error ? error.message : String(error)
      },
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
