import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { collection } from "@/lib/firebase/database-helpers";

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

    // Get the user's university
    const userDoc = await collection("users").doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.universityId) {
      return NextResponse.json(
        { error: "No university associated with your account" },
        { status: 400 }
      );
    }

    // Create the program
    const programId = `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const programRef = collection("programs").doc(programId);
    const now = Date.now();

    await programRef.set({
      universityId: userData.universityId,
      name,
      degree,
      description,
      requirements,
      feeCents: parseInt(feeCents),
      currency,
      deadline: new Date(deadline).getTime(),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      programId: programId,
    });
  } catch (error: any) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
