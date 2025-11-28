/**
 * Update Payment API
 * PATCH /api/uni/payments/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { PaymentStatus } from "@/lib/types/uni";
import * as admin from "firebase-admin";

export async function PATCH(
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
    const { status, notes } = body as { status: PaymentStatus; notes?: string };

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Get payment
    const paymentRef = db.collection("payments").doc(params.id);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data()!;
    const universityId = paymentData.universityId;

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

    // Update payment
    await paymentRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
      ...(notes ? { notes } : {}),
      ...(status === "paid" && !paymentData.paidAt
        ? { paidAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
      ...(status === "refunded" && !paymentData.refundedAt
        ? { refundedAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
    });

    // Get updated payment
    const updatedDoc = await paymentRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: params.id,
      status: updatedData?.status,
      updatedAt: updatedData?.updatedAt,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
