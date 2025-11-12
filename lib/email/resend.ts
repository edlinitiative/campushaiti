import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Campus Haiti <noreply@campushaiti.com>",
      ...params,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

// Email templates
export function getWelcomeEmail(name: string, locale: string = "en"): string {
  const messages: Record<string, { greeting: string; message: string }> = {
    en: {
      greeting: `Hello ${name},`,
      message: "Thank you for joining Campus Haiti. We're excited to help you with your university applications.",
    },
    fr: {
      greeting: `Bonjour ${name},`,
      message: "Merci de rejoindre Campus Haïti. Nous sommes ravis de vous aider avec vos candidatures universitaires.",
    },
    ht: {
      greeting: `Bonjou ${name},`,
      message: "Mèsi pou ou rantre nan Campus Ayiti. Nou kontan pou ede w ak aplikasyon inivèsite yo.",
    },
  };

  const msg = messages[locale] || messages.en;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campus Haiti</h1>
          </div>
          <div class="content">
            <p>${msg.greeting}</p>
            <p>${msg.message}</p>
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getSubmissionReceivedEmail(name: string, locale: string = "en"): string {
  const messages: Record<string, { message: string }> = {
    en: {
      message: "We've received your application. You'll be notified once it's been reviewed.",
    },
    fr: {
      message: "Nous avons reçu votre candidature. Vous serez informé une fois qu'elle aura été examinée.",
    },
    ht: {
      message: "Nou resevwa aplikasyon ou. Nou pral notifye w lè yo fin egzaminen l.",
    },
  };

  const msg = messages[locale] || messages.en;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Submitted</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>${msg.message}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPaymentReceiptEmail(
  name: string,
  amountCents: number,
  currency: string,
  locale: string = "en"
): string {
  const amount = (amountCents / 100).toFixed(2);

  const messages: Record<string, { message: string }> = {
    en: {
      message: "Thank you for your payment.",
    },
    fr: {
      message: "Merci pour votre paiement.",
    },
    ht: {
      message: "Mèsi pou peman ou.",
    },
  };

  const msg = messages[locale] || messages.en;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .receipt { background: white; padding: 15px; margin: 20px 0; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>${msg.message}</p>
            <div class="receipt">
              <p><strong>Amount:</strong> ${currency} ${amount}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
