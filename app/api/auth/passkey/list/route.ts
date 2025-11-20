import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { collection } from "@/lib/firebase/database-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
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

    // Get passkeys from Firestore
    const passkeysRef = collection("passkeys");
    const snapshot = await passkeysRef
      .where("userId", "==", userId)
      .get();

    const passkeys = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastUsed: doc.data().lastUsed?.toDate(),
    }));

    return NextResponse.json({ passkeys });
  } catch (error: any) {
    console.error("Error fetching passkeys:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch passkeys" },
      { status: 500 }
    );
  }
}
