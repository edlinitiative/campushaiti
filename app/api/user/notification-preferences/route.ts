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

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const preferences = userData?.notificationPreferences || {};

    return NextResponse.json({
      smsEnabled: preferences.smsEnabled ?? true, // Default to enabled
      emailEnabled: preferences.emailEnabled ?? true,
      applicationUpdates: preferences.applicationUpdates ?? true,
      deadlineReminders: preferences.deadlineReminders ?? true,
      announcements: preferences.announcements ?? true,
    });
  } catch (error: any) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch preferences" },
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
    const preferences = await request.json();

    await db.collection("users")
      .doc(decodedToken.uid)
      .update({
        notificationPreferences: {
          smsEnabled: preferences.smsEnabled ?? true,
          emailEnabled: preferences.emailEnabled ?? true,
          applicationUpdates: preferences.applicationUpdates ?? true,
          deadlineReminders: preferences.deadlineReminders ?? true,
          announcements: preferences.announcements ?? true,
          updatedAt: Date.now(),
        },
      });

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated",
    });
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}
