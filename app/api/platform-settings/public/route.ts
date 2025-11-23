import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to check if live chat is enabled
 * No authentication required - anyone can check this setting
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    
    const settingsDoc = await db.collection("platform_settings").doc("general").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    return NextResponse.json({
      liveChatEnabled: settings?.enableLiveChat ?? true,
    });
  } catch (error: any) {
    console.error("Error fetching public platform settings:", error);
    // Default to enabled on error
    return NextResponse.json({
      liveChatEnabled: true,
    });
  }
}
