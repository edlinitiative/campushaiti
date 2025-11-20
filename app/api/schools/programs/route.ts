import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    
    if (!user || (user.role !== "SCHOOL_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, degree, description, requirements, feeCents, currency, deadline } = body;

    if (!name || !degree || !description || !requirements || feeCents === undefined || !currency || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Get the user's university
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.universityId) {
      return NextResponse.json(
        { error: "No university associated with your account" },
        { status: 400 }
      );
    }

    // Create the program
    const programRef = db.collection("programs").doc();
    const now = new Date();

    await programRef.set({
      universityId: userData.universityId,
      name,
      degree,
      description,
      requirements,
      feeCents: parseInt(feeCents),
      currency,
      deadline: new Date(deadline),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      programId: programRef.id,
    });
  } catch (error: any) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
