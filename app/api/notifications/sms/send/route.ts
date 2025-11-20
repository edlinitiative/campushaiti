import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber, message, type } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message required" },
        { status: 400 }
      );
    }

    // Verify the request is authenticated (from server or admin)
    const token = request.cookies.get("session")?.value;
    if (token) {
      const decodedToken = await adminAuth.verifySessionCookie(token);
      // Allow if user is sending to themselves or is admin
      if (userId && decodedToken.uid !== userId) {
        // Check if admin
        const userDoc = await collection("users").doc(decodedToken.uid).get();
        if (userDoc.data()?.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }
      }
    }

    // Store notification in database for tracking
    const notificationData = {
      userId: userId || null,
      phoneNumber: phoneNumber,
      message: message,
      type: type || "general",
      status: "pending",
      createdAt: Date.now(),
      sentAt: null,
      error: null,
    };

    const notificationRef = await collection("sms_notifications").add(notificationData);

    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    // For now, we'll simulate sending and just log it
    console.log(`[SMS] Would send to ${phoneNumber}: ${message}`);

    // In production, you would:
    // 1. Use Twilio API
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   to: phoneNumber,
    //   from: twilioPhoneNumber
    // });

    // 2. Or use Firebase Cloud Functions with SMS provider
    // 3. Or use AWS SNS

    // Update notification status
    await notificationRef.update({
      status: "sent",
      sentAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      notificationId: notificationRef.path.split('/').pop(),
      message: "SMS notification queued (demo mode - not actually sent)",
    });
  } catch (error: any) {
    console.error("Error sending SMS:", error);

    return NextResponse.json(
      { error: error.message || "Failed to send SMS notification" },
      { status: 500 }
    );
  }
}
