import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";



export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    const { userId, passkeyId } = await request.json();

    if (!userId || !passkeyId) {
      return NextResponse.json(
        { error: "Missing userId or passkeyId" },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const token = request.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the passkey from Firestore
    await db.collection("passkeys").doc(passkeyId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting passkey:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete passkey" },
      { status: 500 }
    );
  }
}
