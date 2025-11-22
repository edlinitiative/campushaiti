import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PUT /api/schools/settings
 * Update university settings (profile, bank account, etc.)
 */


export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
    
    // Verify user is school admin or admin
    if (decodedClaims.role !== "SCHOOL_ADMIN" && decodedClaims.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { universityId, ...updates } = body;

    if (!universityId) {
      return NextResponse.json(
        { error: "University ID is required" },
        { status: 400 }
      );
    }

    const universityRef = db.collection("universities").doc(universityId);
    const universityDoc = await universityRef.get();

    if (!universityDoc.exists) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    // Verify user has access to this university
    if (decodedClaims.role === "SCHOOL_ADMIN") {
      const university = universityDoc.data();
      if (!university!.adminUids || !university!.adminUids.includes(decodedClaims.uid)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Sanitize updates - only allow specific fields
    const allowedUpdates: any = {
      updatedAt: Date.now(),
    };

    if (updates.name) allowedUpdates.name = updates.name;
    if (updates.slug) allowedUpdates.slug = updates.slug;
    if (updates.description) allowedUpdates.description = updates.description;
    if (updates.city) allowedUpdates.city = updates.city;
    if (updates.country) allowedUpdates.country = updates.country;
    if (updates.website !== undefined) allowedUpdates.website = updates.website;
    if (updates.email) allowedUpdates.email = updates.email;
    if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
    if (updates.bankAccount) allowedUpdates.bankAccount = updates.bankAccount;

    await universityRef.update(allowedUpdates);

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
