import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/service";
import { emailTemplates } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = body;

    // Validate inputs
    if (!to || !template || !data) {
      return NextResponse.json(
        { error: "Missing required fields: to, template, data" },
        { status: 400 }
      );
    }

    // Get template function
    const templateFn = emailTemplates[template as keyof typeof emailTemplates];
    if (!templateFn) {
      return NextResponse.json(
        { error: `Template '${template}' not found` },
        { status: 400 }
      );
    }

    // Generate email content
    const emailContent = templateFn(data as any);

    // Send email
    const result = await sendEmail({
      to,
      ...emailContent,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
