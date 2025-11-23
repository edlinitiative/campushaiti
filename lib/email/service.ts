/**
 * Email service for sending notifications
 * Supports multiple email providers
 */

import { emailTemplates } from "./templates";

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
    // Check which email provider is configured
    if (process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(options);
    } else if (process.env.SMTP_HOST) {
      return await sendWithSMTP(options);
    } else {
      console.warn("No email provider configured. Email not sent:", options.subject);
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
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
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard`;
  
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
}) {
  const applicationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/schools/dashboard/applications`;
  
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
