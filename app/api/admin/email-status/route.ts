import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/email-status
 * Check email provider configuration status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = {
      configured: false,
      provider: "none",
      fromEmail: process.env.FROM_EMAIL || "Not set (will use default)",
      checks: {
        resend: {
          configured: !!process.env.RESEND_API_KEY,
          apiKey: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : null,
          recommendation: "Recommended - 100 emails/day free, 3000/month free",
        },
        sendgrid: {
          configured: !!process.env.SENDGRID_API_KEY,
          apiKey: process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 8)}...` : null,
          recommendation: "Alternative - 100 emails/day free",
        },
        smtp: {
          configured: !!process.env.SMTP_HOST,
          host: process.env.SMTP_HOST || null,
          recommendation: "Gmail SMTP - 500 emails/day free",
        },
      },
      warnings: [],
      instructions: {},
    };

    // Determine which provider will be used
    if (process.env.RESEND_API_KEY) {
      status.configured = true;
      status.provider = "resend";
      
      // Check if FROM_EMAIL is using default Resend domain
      if (!process.env.FROM_EMAIL || process.env.FROM_EMAIL.includes("resend.dev")) {
        status.warnings.push(
          "Using default Resend email (onboarding@resend.dev). For production, verify your own domain."
        );
        status.instructions = {
          title: "To use your own domain with Resend:",
          steps: [
            "1. Go to resend.com/domains",
            "2. Add your domain (e.g., campushaiti.com)",
            "3. Add DNS records (MX, TXT, CNAME)",
            "4. Verify domain",
            "5. Set FROM_EMAIL=noreply@yourdomain.com",
          ],
        };
      }
    } else if (process.env.SENDGRID_API_KEY) {
      status.configured = true;
      status.provider = "sendgrid";
      status.warnings.push("Consider switching to Resend for easier setup and better developer experience.");
    } else if (process.env.SMTP_HOST) {
      status.configured = true;
      status.provider = "smtp";
      status.warnings.push("SMTP has daily limits (500 for Gmail). Consider Resend or SendGrid for higher volume.");
    } else {
      status.warnings.push("No email provider configured. Invitations will work but emails won't be sent automatically.");
      status.instructions = {
        title: "To enable email sending (choose one):",
        steps: [
          "Option 1 - Resend (Recommended):",
          "  1. Sign up at resend.com (free)",
          "  2. Get API key from dashboard",
          "  3. Add to Vercel: RESEND_API_KEY=re_...",
          "",
          "Option 2 - SendGrid:",
          "  1. Sign up at sendgrid.com (free)",
          "  2. Create API key",
          "  3. Add to Vercel: SENDGRID_API_KEY=SG...",
          "",
          "Option 3 - Gmail SMTP:",
          "  1. Enable 2FA on Gmail",
          "  2. Generate app password",
          "  3. Add to Vercel: SMTP_HOST=smtp.gmail.com",
        ],
      };
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error checking email status:", error);
    return NextResponse.json(
      { error: "Failed to check email status" },
      { status: 500 }
    );
  }
}
