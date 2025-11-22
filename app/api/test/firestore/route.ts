import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    
    const collections = [
      "users",
      "applicationItems",
      "documents",
      "programs",
      "universities",
      "auditLogs",
      "profiles",
      "schools",
      "notifications",
    ];

    const results: Record<string, any> = {};

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(5).get();
        results[collectionName] = {
          count: snapshot.size,
          sampleIds: snapshot.docs.map(doc => doc.id),
        };
      } catch (error: any) {
        results[collectionName] = {
          error: error.message,
        };
      }
    }

    return NextResponse.json({
      success: true,
      collections: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
