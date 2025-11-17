import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

// Lazy load Stripe to avoid initialization during build
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
  });
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { paymentId, applicationItemId } = session.metadata || {};

      if (paymentId) {
        // Update payment status
        const paymentDoc = await adminDb.collection("payments").doc(paymentId).get();
        const paymentData = paymentDoc.data();
        
        await adminDb.collection("payments").doc(paymentId).update({
          status: "PAID",
          updatedAt: new Date(),
        });

        // Update application item
        if (applicationItemId) {
          await adminDb.collection("applicationItems").doc(applicationItemId).update({
            status: "PAID",
            paymentId,
            "checklist.paymentReceived": true,
            updatedAt: new Date(),
          });
          
          // Send payment confirmation email
          try {
            const appItemDoc = await adminDb.collection("applicationItems").doc(applicationItemId).get();
            const appItemData = appItemDoc.data();
            
            if (appItemData && paymentData) {
              const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://campushaiti.com'}/dashboard`;
              
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://campushaiti.com'}/api/email/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: appItemData.applicantEmail,
                  template: 'paymentConfirmation',
                  data: {
                    studentName: appItemData.applicantName,
                    programName: appItemData.programName,
                    amount: (paymentData.amount / 100).toFixed(2),
                    currency: paymentData.currency?.toUpperCase() || 'USD',
                    transactionId: paymentId,
                    dashboardUrl
                  }
                })
              });
            }
          } catch (emailErr) {
            console.error('Failed to send payment confirmation email:', emailErr);
            // Don't block payment processing if email fails
          }
        }

        console.log(`Payment ${paymentId} marked as PAID`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
