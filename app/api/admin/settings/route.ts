import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Get platform settings
 */
export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();

    // Verify user is authenticated and is an admin
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get platform settings
    const settingsRef = db.collection("platform_settings").doc("general");
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      return NextResponse.json({
        platformName: "Campus Haiti",
        supportEmail: "support@campushaiti.org",
        enableRegistrations: true,
        requireEmailVerification: true,
        maintenanceMode: false,
        maxApplicationsPerUser: 10,
        defaultApplicationFee: 5000,
        welcomeMessage: "Welcome to Campus Haiti - Your gateway to higher education in Haiti",
      });
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();

    // Verify user is authenticated and is an admin
    const user = await getServerUser();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate settings
    const allowedFields = [
      'platformName',
      'supportEmail',
      'enableRegistrations',
      'requireEmailVerification',
      'maintenanceMode',
      'maxApplicationsPerUser',
      'defaultApplicationFee',
      'welcomeMessage',
    ];

    const updates: any = {
      updatedAt: Date.now(),
      updatedBy: user.uid,
    };

    // Only update allowed fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Save to Firestore
    const settingsRef = db.collection("platform_settings").doc("general");
    await settingsRef.set(updates, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
