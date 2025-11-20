import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerUser } from "@/lib/auth/server-auth";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = "force-dynamic";

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
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationItemId, amountCents, currency = "USD" } = await request.json();

    if (!applicationItemId || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create payment record in Firestore
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentRef = collection("payments").doc(paymentId);
    await paymentRef.set({
      provider: "STRIPE",
      providerRef: "", // Will be updated after session creation
      amountCents,
      currency,
      status: "PENDING",
      metadata: {
        applicationItemId,
        applicantUid: user.uid,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "University Application Fee",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/apply/payment`,
      metadata: {
        paymentId: paymentId,
        applicationItemId,
        applicantUid: user.uid,
      },
    });

    // Update payment record with session ID
    await paymentRef.update({
      providerRef: session.id,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
