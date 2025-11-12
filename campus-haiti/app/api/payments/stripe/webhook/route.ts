import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
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
