import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth/server-auth";
import { cookies } from "next/headers";

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

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true }, {
      headers: {
        "Set-Cookie": `session=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 5}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
      }
    });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
