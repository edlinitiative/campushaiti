import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/payments/stripe/callback
 * Handle Stripe Connect OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle error from Stripe
    if (error) {
      console.error("Stripe Connect error:", error, errorDescription);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin");
      return NextResponse.redirect(
        `${baseUrl}/schools/dashboard/settings?stripe_error=${encodeURIComponent(errorDescription || error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    // Parse state to get university ID and user ID
    const [universityId, userId, timestamp] = state.split(":");
    
    // Verify state is recent (within 10 minutes)
    const stateAge = Date.now() - parseInt(timestamp);
    if (stateAge > 10 * 60 * 1000) {
      return NextResponse.json(
        { error: "State expired" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    
    if (!stripeSecretKey || !clientId) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Stripe token exchange failed:", errorData);
      return NextResponse.json(
        { error: "Failed to exchange code for token" },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const stripeUserId = tokenData.stripe_user_id;

    // Update university with Stripe account ID
    await adminDb.collection("universities").doc(universityId).update({
      stripeAccountId: stripeUserId,
      updatedAt: Date.now(),
    });

    // Redirect back to settings page with success
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin");
    return NextResponse.redirect(
      `${baseUrl}/schools/dashboard/settings?stripe_success=true`
    );
  } catch (error) {
    console.error("Error handling Stripe callback:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin");
    return NextResponse.redirect(
      `${baseUrl}/schools/dashboard/settings?stripe_error=An+error+occurred`
    );
  }
}
