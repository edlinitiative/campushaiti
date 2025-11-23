import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/health
 * Check Firebase Admin authentication health
 */
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID || "NOT SET",
    };

    // Try to initialize Firebase Admin
    let adminAuthStatus = "unknown";
    try {
      const adminAuth = getAdminAuth();
      if (adminAuth && typeof adminAuth.createSessionCookie === 'function') {
        adminAuthStatus = "initialized";
      } else {
        adminAuthStatus = "not_initialized";
      }
    } catch (error: any) {
      adminAuthStatus = `error: ${error.message}`;
    }

    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      adminAuth: adminAuthStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
