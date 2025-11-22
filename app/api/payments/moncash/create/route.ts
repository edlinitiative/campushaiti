import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { monCash } from "@/lib/payments/moncash";

export const dynamic = "force-dynamic";



export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationItemId, amountCents, currency = "HTG" } = await request.json();

    if (!applicationItemId || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment record in Firestore
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentRef = db.collection("payments").doc(paymentId);
    await paymentRef.set({
      provider: "MONCASH",
      providerRef: "",
      amountCents,
      currency,
      status: "PENDING",
      metadata: {
        applicationItemId,
        applicantUid: user.uid,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create MonCash payment
    const paymentResponse = await monCash.createPayment({
      amountCents,
      orderId: paymentId,
    });

    // Update payment record with transaction ID
    await paymentRef.update({
      providerRef: paymentResponse.transactionId,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      paymentUrl: paymentResponse.paymentUrl,
      transactionId: paymentResponse.transactionId,
    });
  } catch (error: any) {
    console.error("MonCash payment error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
