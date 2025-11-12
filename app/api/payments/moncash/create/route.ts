import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { monCash } from "@/lib/payments/moncash";

export async function POST(request: NextRequest) {
  try {
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
    const paymentRef = await adminDb.collection("payments").add({
      provider: "MONCASH",
      providerRef: "",
      amountCents,
      currency,
      status: "PENDING",
      metadata: {
        applicationItemId,
        applicantUid: user.uid,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create MonCash payment
    const paymentResponse = await monCash.createPayment({
      amountCents,
      orderId: paymentRef.id,
    });

    // Update payment record with transaction ID
    await paymentRef.update({
      providerRef: paymentResponse.transactionId,
      updatedAt: new Date(),
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
