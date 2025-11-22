import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";



export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (userDoc.data()?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get platform settings from Realtime Database
    const settingsDoc = await db.collection("platform_settings").doc("general").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};

    return NextResponse.json({
      liveChatEnabled: settings?.liveChatEnabled ?? true,
      maintenanceMode: settings?.maintenanceMode ?? false,
    });
  } catch (error: any) {
    console.error("Error fetching platform settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (userDoc.data()?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { liveChatEnabled, maintenanceMode } = await request.json();

    // Update platform settings
    await db.collection("platform_settings").doc("general").set(
      {
        liveChatEnabled: liveChatEnabled ?? true,
        maintenanceMode: maintenanceMode ?? false,
        updatedAt: Date.now(),
        updatedBy: decodedToken.uid,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating platform settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
