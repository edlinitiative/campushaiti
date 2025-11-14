import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/payments/stripe/connect
 * Initiate Stripe Connect OAuth flow
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { universityId } = body;

    if (!universityId) {
      return NextResponse.json(
        { error: "University ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this university
    if (decodedClaims.role === "SCHOOL_ADMIN") {
      const universityRef = adminDb.collection("universities").doc(universityId);
      const universityDoc = await universityRef.get();
      
      if (!universityDoc.exists) {
        return NextResponse.json({ error: "University not found" }, { status: 404 });
      }

      const university = universityDoc.data();
      if (!university!.adminUids || !university!.adminUids.includes(decodedClaims.uid)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    // Build Stripe Connect OAuth URL
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Stripe Connect not configured" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin");
    const redirectUri = `${baseUrl}/api/payments/stripe/callback`;
    
    // Store state for verification
    const state = `${universityId}:${decodedClaims.uid}:${Date.now()}`;
    
    const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=read_write&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}`;

    return NextResponse.json({
      url: stripeOAuthUrl,
    });
  } catch (error) {
    console.error("Error initiating Stripe Connect:", error);
    return NextResponse.json(
      { error: "Failed to initiate Stripe Connect" },
      { status: 500 }
    );
  }
}
