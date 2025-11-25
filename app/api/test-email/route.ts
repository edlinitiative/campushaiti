import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Test endpoint to verify Resend email sending
 * GET /api/test-email
 */
export async function GET(request: NextRequest) {
  try {
    console.log("=== EMAIL TEST ===");
    console.log("Environment variables:");
    console.log("  RESEND_API_KEY:", process.env.RESEND_API_KEY ? `Set (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : "NOT SET");
    console.log("  FROM_EMAIL:", process.env.FROM_EMAIL || "Not set (will use onboarding@resend.dev)");
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "RESEND_API_KEY not configured",
        message: "Add RESEND_API_KEY to your environment variables"
      }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    console.log("Attempting to send test email...");
    console.log("From:", fromEmail);
    console.log("To: delivered@resend.dev (Resend's test email)");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: "delivered@resend.dev", // Resend's test email that always succeeds
      subject: "Test Email from Campus Haiti",
      html: "<h1>Test Email</h1><p>If you receive this, Resend is working correctly!</p>",
      text: "Test Email - If you receive this, Resend is working correctly!",
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({
        success: false,
        error: error,
        message: "Email sending failed"
      }, { status: 500 });
    }

    console.log("✅ Email sent successfully!");
    console.log("Email ID:", data?.id);
    console.log("==================");

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      emailId: data?.id,
      from: fromEmail,
      to: "delivered@resend.dev"
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
