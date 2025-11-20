import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export async function POST(request: NextRequest) {
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

    const { message, recipientType, specificUserIds } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    let recipients: any[] = [];

    // Get recipients based on type
    if (specificUserIds && Array.isArray(specificUserIds)) {
      // Specific users
      const userDocs = await Promise.all(
        specificUserIds.map((id) => collection("users").doc(id).get())
      );
      recipients = userDocs
        .filter((doc) => doc.exists && doc.data()?.phoneNumber)
        .map((doc) => ({
          userId: doc.id,
          phoneNumber: doc.data()!.phoneNumber,
          fullName: doc.data()!.fullName,
        }));
    } else if (recipientType === "all") {
      // All users with phone numbers
      const usersSnapshot = await collection("users")
        .where("phoneNumber", "!=", null)
        .get();
      recipients = usersSnapshot.docs.map((doc) => ({
        userId: doc.id,
        phoneNumber: doc.data().phoneNumber,
        fullName: doc.data().fullName,
      }));
    } else if (recipientType === "applicants") {
      // Only applicants
      const usersSnapshot = await collection("users")
        .where("role", "==", "APPLICANT")
        .where("phoneNumber", "!=", null)
        .get();
      recipients = usersSnapshot.docs.map((doc) => ({
        userId: doc.id,
        phoneNumber: doc.data().phoneNumber,
        fullName: doc.data().fullName,
      }));
    } else if (recipientType === "verified") {
      // Only users with verified emails
      const allUsers = await adminAuth.listUsers();
      const verifiedUsers = allUsers.users.filter((user) => user.emailVerified);
      const userDocs = await Promise.all(
        verifiedUsers.map((user) =>
          collection("users").doc(user.uid).get()
        )
      );
      recipients = userDocs
        .filter((doc) => doc.exists && doc.data()?.phoneNumber)
        .map((doc) => ({
          userId: doc.id,
          phoneNumber: doc.data()!.phoneNumber,
          fullName: doc.data()!.fullName,
        }));
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found with phone numbers" },
        { status: 400 }
      );
    }

    // Create bulk notification record
    const bulkNotificationId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bulkNotificationRef = collection("bulk_sms_notifications").doc(bulkNotificationId);
    await bulkNotificationRef.set({
      message,
      recipientType: recipientType || "specific",
      recipientCount: recipients.length,
      status: "processing",
      createdAt: Date.now(),
      createdBy: decodedToken.uid,
      sentCount: 0,
      failedCount: 0,
    });

    // Queue individual SMS notifications
    const notificationPromises = recipients.map(async (recipient) => {
      const notificationData = {
        userId: recipient.userId,
        phoneNumber: recipient.phoneNumber,
        message: message,
        type: "bulk",
        bulkNotificationId: bulkNotificationId,
        status: "pending",
        createdAt: Date.now(),
        sentAt: null,
        error: null,
      };

      const notificationId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notificationRef = collection("sms_notifications").doc(notificationId);
      await notificationRef.set(notificationData);

      // TODO: Integrate with SMS provider
      console.log(`[BULK SMS] Would send to ${recipient.phoneNumber}: ${message}`);

      // In production, send actual SMS here
      // For now, mark as sent
      await notificationRef.update({
        status: "sent",
        sentAt: Date.now(),
      });

      return { success: true, notificationId: notificationId };
    });

    // Wait for all to process
    const results = await Promise.allSettled(notificationPromises);
    const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    // Update bulk notification status
    await bulkNotificationRef.update({
      status: "completed",
      sentCount,
      failedCount,
      completedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      bulkNotificationId: bulkNotificationId,
      recipientCount: recipients.length,
      sentCount,
      failedCount,
      message: "Bulk SMS notifications queued (demo mode - not actually sent)",
    });
  } catch (error: any) {
    console.error("Error sending bulk SMS:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send bulk SMS notifications" },
      { status: 500 }
    );
  }
}
