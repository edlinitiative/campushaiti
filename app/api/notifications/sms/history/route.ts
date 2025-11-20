import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(token);
    const userDoc = await collection("users").doc(decodedToken.uid).get();

    if (userDoc.data()?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type"); // "single" or "bulk"

    let notifications: any[] = [];

    if (!type || type === "single") {
      // Get individual SMS notifications
      const notificationsSnapshot = await collection("sms_notifications")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const singleNotifications = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        sentAt: doc.data().sentAt?.toDate().toISOString() || null,
        notificationType: "single",
      }));

      notifications = [...notifications, ...singleNotifications];
    }

    if (!type || type === "bulk") {
      // Get bulk SMS notifications
      const bulkNotificationsSnapshot = await collection("bulk_sms_notifications")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const bulkNotifications = bulkNotificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        completedAt: doc.data().completedAt?.toDate().toISOString() || null,
        notificationType: "bulk",
      }));

      notifications = [...notifications, ...bulkNotifications];
    }

    // Sort by creation date
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit to requested size
    notifications = notifications.slice(0, limit);

    // Get stats
    const totalSentSnapshot = await collection("sms_notifications")
      .where("status", "==", "sent")
      .get();

    const totalFailedSnapshot = await collection("sms_notifications")
      .where("status", "==", "failed")
      .get();

    const totalPendingSnapshot = await collection("sms_notifications")
      .where("status", "==", "pending")
      .get();

    return NextResponse.json({
      notifications,
      stats: {
        totalSent: totalSentSnapshot.docs.length,
        totalFailed: totalFailedSnapshot.docs.length,
        totalPending: totalPendingSnapshot.docs.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching SMS history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch SMS history" },
      { status: 500 }
    );
  }
}
