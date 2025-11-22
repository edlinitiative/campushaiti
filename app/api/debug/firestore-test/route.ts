import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 30) + "...",
      nextPhase: process.env.NEXT_PHASE,
    };

    if (!envCheck.hasProjectId || !envCheck.hasClientEmail || !envCheck.hasPrivateKey) {
      return NextResponse.json({
        success: false,
        step: "missing_env_vars",
        envCheck,
        message: "Firebase credentials not configured in Vercel",
      });
    }

    // Import getAdminApp to test it directly
    const { default: getAdminApp } = await import("@/lib/firebase/admin");
    const app = getAdminApp();
    
    const appInfo = {
      hasApp: !!app,
      appType: app?.constructor?.name,
      appKeys: app ? Object.keys(app).length : 0,
      isEmptyObject: app ? Object.keys(app).length === 0 : false,
    };

    const db = getAdminDb();
    
    // Get database info
    const dbInfo = {
      type: db.constructor.name,
      hasDb: !!db,
      isObject: typeof db === 'object',
      hasCollectionMethod: typeof (db as any).collection === 'function',
      projectId: (db as any)._settings?.projectId || (db as any).projectId,
    };

    // Try to create a test document
    let writeTest = null;
    try {
      await db.collection("_test").doc("test").set({ test: true, timestamp: Date.now() });
      const testDoc = await db.collection("_test").doc("test").get();
      writeTest = {
        writeSuccess: true,
        readSuccess: testDoc.exists,
        data: testDoc.data(),
      };
      // Clean up
      await db.collection("_test").doc("test").delete();
    } catch (writeError: any) {
      writeTest = {
        writeSuccess: false,
        error: writeError.message,
        errorCode: writeError.code,
      };
    }

    return NextResponse.json({
      success: true,
      envCheck,
      appInfo,
      dbInfo,
      writeTest,
      message: "Database connection working",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      step: "init_failed",
      error: error.message,
      errorCode: error.code,
      stack: error.stack,
    }, { status: 500 });
  }
}
