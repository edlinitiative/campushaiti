import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    await requireRole(["ADMIN"]);

    const { userId, disabled } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Update user disabled status in Firebase Auth
    await adminAuth.updateUser(userId, {
      disabled: disabled,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update user status" },
      { status: 500 }
    );
  }
}
