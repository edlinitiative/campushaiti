/**
 * Single Template API
 * GET: Fetch template, PUT: Update template, DELETE: Delete template
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { MessageTemplateType } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getAdminDb();
    const templateDoc = await db.collection("messageTemplates").doc(params.id).get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: templateDoc.id,
      ...templateDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    const body = await request.json();
    const { type, name, subject, body: templateBody, variables } = body;

    // Get template
    const templateRef = db.collection("messageTemplates").doc(params.id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = templateDoc.data()!;
    const universityId = templateData.universityId;

    // Check permissions
    if (decodedClaims.role !== "ADMIN") {
      const universityDoc = await db.collection("universities").doc(universityId).get();
      const universityData = universityDoc.data();
      const isLegacyAdmin = universityData?.adminUids?.includes(userId);
      const staffDoc = await db
        .collection("universities")
        .doc(universityId)
        .collection("staff")
        .doc(userId)
        .get();

      if (!isLegacyAdmin && !staffDoc.exists) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Update template
    await templateRef.update({
      ...(type && { type: type as MessageTemplateType }),
      ...(name && { name }),
      ...(subject && { subject }),
      ...(templateBody && { body: templateBody }),
      ...(variables && { variables }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    // Get template
    const templateRef = db.collection("messageTemplates").doc(params.id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = templateDoc.data()!;
    const universityId = templateData.universityId;

    // Check permissions
    if (decodedClaims.role !== "ADMIN") {
      const universityDoc = await db.collection("universities").doc(universityId).get();
      const universityData = universityDoc.data();
      const isLegacyAdmin = universityData?.adminUids?.includes(userId);
      const staffDoc = await db
        .collection("universities")
        .doc(universityId)
        .collection("staff")
        .doc(userId)
        .get();

      if (!isLegacyAdmin && !staffDoc.exists) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Delete template
    await templateRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
