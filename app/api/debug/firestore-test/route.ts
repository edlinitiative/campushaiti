import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    
    // Get database info
    const dbInfo = {
      type: db.constructor.name,
      projectId: (db as any)._settings?.projectId || (db as any).projectId,
    };

    // Try to list collections
    let collections: any[] = [];
    try {
      const collectionRefs = await db.listCollections();
      collections = collectionRefs.map(col => col.id);
    } catch (listError: any) {
      return NextResponse.json({
        success: false,
        step: "list_collections_failed",
        dbInfo,
        error: listError.message,
        errorCode: listError.code,
      });
    }

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
      dbInfo,
      collections,
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
