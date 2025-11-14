/**
 * Email templates for school portal notifications
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  /**
   * University Registration Approved
   */
  universityApproved: (data: {
    universityName: string;
    contactName: string;
    email: string;
    tempPassword?: string;
    dashboardUrl: string;
  }): EmailTemplate => ({
    subject: `Welcome to Campus Haiti - ${data.universityName} Approved!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .credentials { background-color: #fff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your university has been approved</p>
            </div>
            <div class="content">
              <p>Dear ${data.contactName},</p>
              
              <p>Great news! <strong>${data.universityName}</strong> has been approved to join Campus Haiti platform.</p>
              
              <p>You can now:</p>
              <ul>
                <li>Create and manage programs</li>
                <li>Customize application questions</li>
                <li>Review student applications</li>
                <li>Configure payment settings</li>
                <li>Manage your team</li>
              </ul>
              
              ${data.tempPassword ? `
              <div class="credentials">
                <h3>Your Login Credentials</h3>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Temporary Password:</strong> ${data.tempPassword}</p>
                <p><em>Please change your password after first login</em></p>
              </div>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">Access Your Dashboard</a>
              </p>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Welcome aboard!</p>
              <p><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Connecting Students with Opportunities</p>
              <p><a href="${data.dashboardUrl.replace('/schools/dashboard', '')}/help">Help Center</a> | <a href="${data.dashboardUrl.replace('/schools/dashboard', '')}/contact">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Congratulations ${data.contactName}!
      
      ${data.universityName} has been approved to join Campus Haiti.
      
      ${data.tempPassword ? `Your login credentials:
      Email: ${data.email}
      Temporary Password: ${data.tempPassword}
      Please change your password after first login.
      ` : ''}
      
      Access your dashboard: ${data.dashboardUrl}
      
      Welcome aboard!
      The Campus Haiti Team
    `,
  }),

  /**
   * University Registration Rejected
   */
  universityRejected: (data: {
    universityName: string;
    contactName: string;
    reason: string;
    reapplyUrl: string;
  }): EmailTemplate => ({
    subject: `Campus Haiti - Registration Update for ${data.universityName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .reason { background-color: #fff; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Update</h1>
            </div>
            <div class="content">
              <p>Dear ${data.contactName},</p>
              
              <p>Thank you for your interest in joining Campus Haiti. After careful review, we are unable to approve the registration for <strong>${data.universityName}</strong> at this time.</p>
              
              <div class="reason">
                <h3>Reason:</h3>
                <p>${data.reason}</p>
              </div>
              
              <p>We encourage you to address the concerns mentioned above and submit a new application when ready.</p>
              
              <p style="text-align: center;">
                <a href="${data.reapplyUrl}" class="button">Submit New Application</a>
              </p>
              
              <p>If you have any questions or need clarification, please contact our support team.</p>
              
              <p>Best regards,<br><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Connecting Students with Opportunities</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Dear ${data.contactName},
      
      Thank you for your interest in joining Campus Haiti. After careful review, we are unable to approve the registration for ${data.universityName} at this time.
      
      Reason:
      ${data.reason}
      
      We encourage you to address the concerns and submit a new application when ready.
      
      Reapply: ${data.reapplyUrl}
      
      Best regards,
      The Campus Haiti Team
    `,
  }),

  /**
   * New University Registration Notification (to Admin)
   */
  newRegistrationNotification: (data: {
    universityName: string;
    contactName: string;
    contactEmail: string;
    city: string;
    country: string;
    reviewUrl: string;
  }): EmailTemplate => ({
    subject: `New University Registration: ${data.universityName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background-color: #fff; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Registration</h1>
              <p>Pending Admin Review</p>
            </div>
            <div class="content">
              <p>A new university has registered and is awaiting approval:</p>
              
              <div class="details">
                <h3>${data.universityName}</h3>
                <p><strong>Location:</strong> ${data.city}, ${data.country}</p>
                <p><strong>Contact Person:</strong> ${data.contactName}</p>
                <p><strong>Email:</strong> ${data.contactEmail}</p>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.reviewUrl}" class="button">Review Registration</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New University Registration - Pending Review
      
      ${data.universityName}
      Location: ${data.city}, ${data.country}
      Contact: ${data.contactName} (${data.contactEmail})
      
      Review: ${data.reviewUrl}
    `,
  }),

  /**
   * Application Received Notification (to School)
   */
  applicationReceived: (data: {
    universityName: string;
    applicantName: string;
    programName: string;
    applicationUrl: string;
  }): EmailTemplate => ({
    subject: `New Application Received - ${data.programName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 New Application</h1>
            </div>
            <div class="content">
              <p>A new application has been submitted to <strong>${data.universityName}</strong>.</p>
              
              <p><strong>Program:</strong> ${data.programName}</p>
              <p><strong>Applicant:</strong> ${data.applicantName}</p>
              
              <p style="text-align: center;">
                <a href="${data.applicationUrl}" class="button">Review Application</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New Application Received
      
      Program: ${data.programName}
      Applicant: ${data.applicantName}
      
      Review: ${data.applicationUrl}
    `,
  }),
};
