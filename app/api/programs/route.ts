import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection("programs")
      .orderBy("name")
      .limit(100)
      .get();

    const programs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(programs);
  } catch (error: any) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}
