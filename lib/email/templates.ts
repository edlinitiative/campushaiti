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

  /**
   * Application Submitted Confirmation (to Student)
   */
  applicationSubmitted: (data: {
    studentName: string;
    programName: string;
    universityName: string;
    applicationId: string;
    dashboardUrl: string;
  }): EmailTemplate => ({
    subject: `Application Submitted - ${data.programName}`,
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
            .info-box { background-color: #fff; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Application Submitted!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.studentName},</p>
              
              <p>Thank you for submitting your application! We've received your application and it's now being reviewed.</p>
              
              <div class="info-box">
                <p><strong>Program:</strong> ${data.programName}</p>
                <p><strong>University:</strong> ${data.universityName}</p>
                <p><strong>Application ID:</strong> ${data.applicationId}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Your application will be reviewed by the admissions team</li>
                <li>You'll receive an email when there's an update on your status</li>
                <li>You can track your application status anytime in your dashboard</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">View Application Status</a>
              </p>
              
              <p>We'll notify you as soon as there's an update on your application.</p>
              
              <p>Best of luck!</p>
              <p><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Your Gateway to Higher Education</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Application Submitted Successfully!
      
      Dear ${data.studentName},
      
      Thank you for submitting your application!
      
      Program: ${data.programName}
      University: ${data.universityName}
      Application ID: ${data.applicationId}
      
      What happens next?
      - Your application will be reviewed
      - You'll receive email updates
      - Track status in your dashboard
      
      View Status: ${data.dashboardUrl}
      
      Best of luck!
      The Campus Haiti Team
    `,
  }),

  /**
   * Application Status Update (to Student)
   */
  applicationStatusUpdate: (data: {
    studentName: string;
    programName: string;
    universityName: string;
    status: string;
    message?: string;
    dashboardUrl: string;
  }): EmailTemplate => {
    const statusConfig = {
      ACCEPTED: {
        color: '#10b981',
        icon: '🎉',
        title: 'Congratulations! You\'ve Been Accepted',
        description: 'We are pleased to inform you that your application has been accepted!'
      },
      REJECTED: {
        color: '#ef4444',
        icon: '📝',
        title: 'Application Decision',
        description: 'After careful review, we regret to inform you that we cannot offer you admission at this time.'
      },
      WAITLISTED: {
        color: '#f59e0b',
        icon: '⏳',
        title: 'You\'ve Been Waitlisted',
        description: 'Your application has been placed on our waitlist. We\'ll notify you if a spot becomes available.'
      },
      UNDER_REVIEW: {
        color: '#3b82f6',
        icon: '🔍',
        title: 'Application Under Review',
        description: 'Your application is currently being reviewed by our admissions team.'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNDER_REVIEW;

    return {
      subject: `${config.title} - ${data.programName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .info-box { background-color: #fff; padding: 20px; border-left: 4px solid ${config.color}; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${config.icon} ${config.title}</h1>
              </div>
              <div class="content">
                <p>Dear ${data.studentName},</p>
                
                <p>${config.description}</p>
                
                <div class="info-box">
                  <p><strong>Program:</strong> ${data.programName}</p>
                  <p><strong>University:</strong> ${data.universityName}</p>
                  <p><strong>Status:</strong> ${status.replace(/_/g, ' ')}</p>
                </div>
                
                ${data.message ? `<p><strong>Message from Admissions:</strong></p><p>${data.message}</p>` : ''}
                
                <p style="text-align: center;">
                  <a href="${data.dashboardUrl}" class="button">View Full Details</a>
                </p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,</p>
                <p><strong>The Campus Haiti Team</strong></p>
              </div>
              <div class="footer">
                <p>Campus Haiti - Your Gateway to Higher Education</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        ${config.title}
        
        Dear ${data.studentName},
        
        ${config.description}
        
        Program: ${data.programName}
        University: ${data.universityName}
        Status: ${status.replace(/_/g, ' ')}
        
        ${data.message ? `Message: ${data.message}` : ''}
        
        View Details: ${data.dashboardUrl}
        
        Best regards,
        The Campus Haiti Team
      `,
    };
  },

  /**
   * Payment Confirmation (to Student)
   */
  paymentConfirmation: (data: {
    studentName: string;
    programName: string;
    amount: string;
    currency: string;
    transactionId: string;
    dashboardUrl: string;
  }): EmailTemplate => ({
    subject: `Payment Confirmed - ${data.programName}`,
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
            .receipt { background-color: #fff; padding: 20px; border: 2px solid #10b981; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed</h1>
            </div>
            <div class="content">
              <p>Dear ${data.studentName},</p>
              
              <p>Your payment has been successfully processed!</p>
              
              <div class="receipt">
                <h3 style="margin-top: 0;">Payment Receipt</h3>
                <p><strong>Program:</strong> ${data.programName}</p>
                <p><strong>Amount Paid:</strong> ${data.amount} ${data.currency}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Your application is now complete and will be reviewed by the admissions team.</p>
              
              <p style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">View Application</a>
              </p>
              
              <p>Keep this email for your records.</p>
              
              <p>Thank you!</p>
              <p><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Your Gateway to Higher Education</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Payment Confirmed
      
      Dear ${data.studentName},
      
      Your payment has been successfully processed!
      
      Payment Receipt:
      Program: ${data.programName}
      Amount: ${data.amount} ${data.currency}
      Transaction ID: ${data.transactionId}
      Date: ${new Date().toLocaleDateString()}
      
      View Application: ${data.dashboardUrl}
      
      Thank you!
      The Campus Haiti Team
    `,
  }),

  /**
   * Custom Message (for bulk emails)
   */
  customMessage: (data: {
    studentName: string;
    subject: string;
    message: string;
  }): EmailTemplate => ({
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .message { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Campus Haiti</h1>
            </div>
            <div class="content">
              <p>Dear ${data.studentName},</p>
              
              <div class="message">
                ${data.message.replace(/\n/g, '<br>')}
              </div>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,</p>
              <p><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Your Gateway to Higher Education</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Dear ${data.studentName},
      
      ${data.message}
      
      If you have any questions, please contact us.
      
      Best regards,
      The Campus Haiti Team
    `,
  }),

  /**
   * Team Invitation Email
   */
  teamInvitation: (data: {
    inviteeName: string;
    inviterName: string;
    universityName: string;
    role: string;
    inviteUrl: string;
    expiresInDays: number;
  }): EmailTemplate => ({
    subject: `You've been invited to join ${data.universityName} on Campus Haiti`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .role-badge { display: inline-block; padding: 6px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-weight: 600; margin: 10px 0; }
            .info-box { background-color: #fff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Team Invitation</h1>
              <p>You've been invited to join an admin team</p>
            </div>
            <div class="content">
              <p>Hello ${data.inviteeName},</p>
              
              <p><strong>${data.inviterName}</strong> has invited you to join the admin team for <strong>${data.universityName}</strong> on Campus Haiti.</p>
              
              <div class="info-box">
                <p style="margin: 0;"><strong>Your Role:</strong></p>
                <div class="role-badge">${data.role}</div>
                <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                  ${data.role === 'ADMIN' 
                    ? 'Full access to manage programs, applications, and settings' 
                    : 'Read-only access to view applications and reports'}
                </p>
              </div>
              
              <p>As a team member, you'll be able to:</p>
              <ul>
                <li>${data.role === 'ADMIN' ? 'Review and manage' : 'View'} student applications</li>
                <li>${data.role === 'ADMIN' ? 'Create and edit' : 'View'} academic programs</li>
                <li>Access ${data.role === 'ADMIN' ? 'comprehensive' : ''} analytics and reports</li>
                ${data.role === 'ADMIN' ? '<li>Customize application questions</li>' : ''}
              </ul>
              
              <p style="text-align: center;">
                <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
              </p>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px;">
                <em>This invitation expires in ${data.expiresInDays} days</em>
              </p>
              
              <p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>
              
              <p>Looking forward to having you on the team!</p>
              <p><strong>The Campus Haiti Team</strong></p>
            </div>
            <div class="footer">
              <p>Campus Haiti - Connecting Students with Opportunities</p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Team Invitation
      
      Hello ${data.inviteeName},
      
      ${data.inviterName} has invited you to join the admin team for ${data.universityName} on Campus Haiti.
      
      Your Role: ${data.role}
      
      Accept invitation: ${data.inviteUrl}
      
      This invitation expires in ${data.expiresInDays} days.
      
      Looking forward to having you on the team!
      The Campus Haiti Team
    `,
  }),
};
