/**
 * Templates API
 * GET: List templates, POST: Create template
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { MessageTemplateType } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Get university ID from header
    const schoolSlug = request.headers.get("x-school-slug");
    if (!schoolSlug) {
      return NextResponse.json({ error: "School not found" }, { status: 400 });
    }

    const universitiesSnapshot = await db
      .collection("universities")
      .where("slug", "==", schoolSlug)
      .limit(1)
      .get();

    if (universitiesSnapshot.empty) {
      return NextResponse.json({ error: "University not found" }, { status: 404 });
    }

    const universityId = universitiesSnapshot.docs[0].id;

    // Get templates
    const templatesSnapshot = await db
      .collection("messageTemplates")
      .where("universityId", "==", universityId)
      .orderBy("type", "asc")
      .orderBy("createdAt", "desc")
      .get();

    const templates = templatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { universityId, type, name, subject, body: templateBody, variables } = body;

    // Validate required fields
    if (!universityId || !type || !name || !subject || !templateBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create template
    const templateRef = await db.collection("messageTemplates").add({
      universityId,
      type: type as MessageTemplateType,
      name,
      subject,
      body: templateBody,
      variables: variables || [],
      isDefault: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
    });

    return NextResponse.json({ id: templateRef.id, success: true });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
