import { NextRequest, NextResponse } from "next/server";
import { collection } from "@/lib/firebase/database-helpers";
import { monCash } from "@/lib/payments/moncash";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    // Verify payment with MonCash
    const paymentStatus = await monCash.verifyPayment({ transactionId });

    // Find payment record
    const paymentsSnapshot = await collection("payments")
      .where("providerRef", "==", transactionId)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // Update payment status if paid
    if (paymentStatus.status === "PAID") {
      await paymentDoc.ref.update({
        status: "PAID",
        updatedAt: Date.now(),
      });

      // Update application item
      const applicationItemId = paymentData.metadata?.applicationItemId;
      if (applicationItemId) {
        await collection("applicationItems").doc(applicationItemId).update({
          status: "PAID",
          paymentId: paymentDoc.id,
          "checklist.paymentReceived": true,
          updatedAt: Date.now(),
        });
      }
    }

    return NextResponse.json(paymentStatus);
  } catch (error: any) {
    console.error("MonCash verify error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
