import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";
import { requireRole } from "@/lib/auth/server-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    await requireRole(["ADMIN"]);

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const provider = searchParams.get("provider"); // google.com, password, phone

    // List all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(limit);
    
    let users = listUsersResult.users.map((userRecord) => {
      // Get primary auth provider
      const providers = userRecord.providerData.map((p) => p.providerId);
      const primaryProvider = providers.includes("google.com") 
        ? "google" 
        : providers.includes("password")
        ? "password"
        : providers.includes("phone")
        ? "phone"
        : "other";

      return {
        id: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        createdAt: userRecord.metadata.creationTime,
        lastSignInAt: userRecord.metadata.lastSignInTime,
        providers: providers,
        primaryProvider: primaryProvider,
        providerData: userRecord.providerData,
      };
    });

    // Filter by provider if specified
    if (provider) {
      users = users.filter((user) => user.primaryProvider === provider);
    }

    // Try to enrich with Firestore data
    try {
      const userIds = users.map((u) => u.id);
      const firestoreDocs = await Promise.all(
        userIds.map((id) => collection("users").doc(id).get())
      );

      users = users.map((user, index) => {
        const firestoreData = firestoreDocs[index].data();
        return {
          ...user,
          role: firestoreData?.role || "APPLICANT",
          fullName: firestoreData?.fullName || user.displayName,
        };
      });
    } catch (firestoreError) {
      console.warn("Could not fetch Firestore data:", firestoreError);
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
