import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token required" },
        { status: 400 }
      );
    }

    // Create session cookie (5 days)
    const sessionCookie = await createSessionCookie(idToken);

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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
