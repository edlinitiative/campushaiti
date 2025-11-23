import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/health
 * Check Firebase Admin authentication health
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Health Check] Starting...");
    
    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasPrivateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      projectId: process.env.FIREBASE_PROJECT_ID || "NOT_SET",
      nodeEnv: process.env.NODE_ENV || "NOT_SET",
    };

    console.log("[Health Check] Environment:", envCheck);

    // Try to initialize Firebase Admin
    let adminAuthStatus = "not_checked";
    let adminAuthError = null;
    
    try {
      const { getAdminAuth } = await import("@/lib/firebase/admin");
      const adminAuth = getAdminAuth();
      
      if (adminAuth && typeof adminAuth.createSessionCookie === 'function') {
        adminAuthStatus = "✅ initialized";
      } else {
        adminAuthStatus = "❌ not_initialized";
      }
    } catch (error: any) {
      adminAuthStatus = "❌ error";
      adminAuthError = error.message;
      console.error("[Health Check] Firebase Admin error:", error);
    }

    const response = {
      status: "ok",
      message: "Health check endpoint is working",
      environment: envCheck,
      firebaseAdmin: {
        status: adminAuthStatus,
        error: adminAuthError,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("[Health Check] Response:", response);
    
    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error("[Health Check] Fatal error:", error);
    return NextResponse.json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      stack: error.stack,
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
