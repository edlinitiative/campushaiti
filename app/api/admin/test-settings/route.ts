import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    
    // Try to write to platform_settings
    await db.collection("platform_settings").doc("general").set(
      {
        maintenanceMode: false,
        updatedAt: Date.now(),
        test: true,
      },
      { merge: true }
    );

    // Try to read it back
    const doc = await db.collection("platform_settings").doc("general").get();
    const data = doc.data();

    return NextResponse.json({
      success: true,
      writeSuccess: true,
      readSuccess: doc.exists,
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorStack: error.stack,
    }, { status: 500 });
  }
}
