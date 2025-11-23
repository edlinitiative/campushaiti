import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth/server-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    { error: "Use POST method to create session" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token required" },
        { status: 400 }
      );
    }

    // Check Firebase Admin credentials
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error("Missing Firebase Admin credentials:", {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      });
      return NextResponse.json(
        { error: "Server configuration error. Firebase Admin credentials not set." },
        { status: 500 }
      );
    }

    console.log("Creating session cookie...");
    // Create session cookie (5 days)
    const sessionCookie = await createSessionCookie(idToken);
    console.log("Session cookie created successfully");

    // Set cookie with proper attributes
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    
    // Use ResponseCookies API for better compatibility
    response.cookies.set({
      name: "session",
      value: sessionCookie,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return response;
  } catch (error: any) {
    console.error("Session creation error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || "Failed to create session",
        details: error.code || "unknown_error"
      },
      { status: 500 }
    );
  }
}
