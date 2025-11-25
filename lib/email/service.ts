/**
 * Email service for sending notifications
 * Supports multiple email providers
 */

import { emailTemplates } from "./templates";
import { getSchoolSubdomainUrl } from "@/lib/utils/subdomain";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Priority order: Resend > SendGrid > SMTP
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend(options);
    } else if (process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(options);
    } else if (process.env.SMTP_HOST) {
      return await sendWithSMTP(options);
    } else {
      console.warn("No email provider configured (RESEND_API_KEY, SENDGRID_API_KEY, or SMTP_HOST). Email not sent:", options.subject);
      console.warn("To enable emails, add one of these to your environment variables:");
      console.warn("  - RESEND_API_KEY=re_... (recommended)");
      console.warn("  - SENDGRID_API_KEY=SG...");
      console.warn("  - SMTP_HOST=smtp.gmail.com");
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send email using Resend (recommended)
 */
async function sendWithResend(options: EmailOptions): Promise<boolean> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Use onboarding@resend.dev as default since it doesn't require domain verification
    // Set FROM_EMAIL only if you have verified your domain in Resend
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    console.log("Sending email via Resend to:", options.to);
    console.log("From:", fromEmail);
    console.log("Subject:", options.subject);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Resend API error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Common Resend errors:
      if (error.message?.includes("not verified")) {
        console.error("⚠️ FROM_EMAIL domain not verified in Resend dashboard");
        console.error("   Go to https://resend.com/domains to verify your domain");
        console.error("   OR remove FROM_EMAIL from environment variables to use onboarding@resend.dev");
      } else if (error.message?.includes("Invalid API key")) {
        console.error("⚠️ RESEND_API_KEY is invalid");
      }
      
      return false;
    }

    console.log("Email sent successfully via Resend. ID:", data?.id);
    return true;
  } catch (error) {
    console.error("Resend error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return false;
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(options: EmailOptions): Promise<boolean> {
  const fromEmail = process.env.FROM_EMAIL || "noreply@campushaiti.com";
  const apiKey = process.env.SENDGRID_API_KEY;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: fromEmail, name: "Campus Haiti" },
      subject: options.subject,
      content: [
        { type: "text/plain", value: options.text },
        { type: "text/html", value: options.html },
      ],
    }),
  });

  return response.ok;
}

/**
 * Send email using SMTP (nodemailer)
 */
async function sendWithSMTP(options: EmailOptions): Promise<boolean> {
  // Note: This requires nodemailer to be installed
  // npm install nodemailer
  // For now, just log and return false
  console.log("SMTP email sending not implemented yet");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  return false;
}

/**
 * Send university approval email
 */
export async function sendUniversityApprovedEmail(data: {
  universityName: string;
  contactName: string;
  email: string;
  tempPassword?: string;
  universitySlug?: string;
}) {
  // Use subdomain URL if slug is provided
  const dashboardUrl = data.universitySlug 
    ? getSchoolSubdomainUrl(data.universitySlug, '/dashboard')
    : `${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard`;
  
  const template = emailTemplates.universityApproved({
    ...data,
    dashboardUrl,
  });

  return await sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send university rejection email
 */
export async function sendUniversityRejectedEmail(data: {
  universityName: string;
  contactName: string;
  email: string;
  reason: string;
}) {
  const reapplyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/schools/register`;
  
  const template = emailTemplates.universityRejected({
    ...data,
    reapplyUrl,
  });

  return await sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send new registration notification to admin
 */
export async function sendNewRegistrationNotification(data: {
  universityName: string;
  contactName: string;
  contactEmail: string;
  city: string;
  country: string;
  registrationId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@campushaiti.com";
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/universities`;
  
  const template = emailTemplates.newRegistrationNotification({
    ...data,
    reviewUrl,
  });

  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send application received notification to school
 */
export async function sendApplicationReceivedEmail(data: {
  schoolEmail: string;
  universityName: string;
  applicantName: string;
  programName: string;
  applicationId: string;
  universitySlug?: string;
}) {
  // Use subdomain URL if slug is provided
  const applicationUrl = data.universitySlug
    ? getSchoolSubdomainUrl(data.universitySlug, '/applications')
    : `${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard/applications`;
  
  const template = emailTemplates.applicationReceived({
    universityName: data.universityName,
    applicantName: data.applicantName,
    programName: data.programName,
    applicationUrl,
  });

  return await sendEmail({
    to: data.schoolEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send team invitation email
 */
export async function sendTeamInvitationEmail(data: {
  email: string;
  inviterName: string;
  universityName: string;
  role: string;
  inviteUrl: string;
  expiresInDays?: number;
}) {
  const template = emailTemplates.teamInvitation({
    inviteeName: data.email.split('@')[0], // Use email username as fallback name
    inviterName: data.inviterName,
    universityName: data.universityName,
    role: data.role,
    inviteUrl: data.inviteUrl,
    expiresInDays: data.expiresInDays || 7,
  });

  return await sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
