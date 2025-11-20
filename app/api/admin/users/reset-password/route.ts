import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { requireRole } from "@/lib/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    await requireRole(["ADMIN"]);

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Get user to check if they have a password provider
    const user = await adminAuth.getUser(userId);
    
    const hasPasswordProvider = user.providerData.some(
      (provider) => provider.providerId === "password"
    );

    if (!hasPasswordProvider || !user.email) {
      return NextResponse.json(
        { error: "User does not have a password account" },
        { status: 400 }
      );
    }

    // Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(user.email);

    // In production, you would send this via email
    // For now, we'll just return success
    // TODO: Integrate with email service to send reset link

    return NextResponse.json({ success: true, resetLink });
  } catch (error: any) {
    console.error("Error sending password reset:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to send password reset" },
      { status: 500 }
    );
  }
}
