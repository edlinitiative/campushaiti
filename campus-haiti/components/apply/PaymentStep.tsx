"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  const t = useTranslations("apply.payment");
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPrograms, setSelectedPrograms] = useState<any[]>([]);

  useEffect(() => {
    loadSelectedPrograms();
  }, []);

  const loadSelectedPrograms = async () => {
    const programIds = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
    const programs = [];
    let total = 0;

    for (const id of programIds) {
      const programDoc = await getDoc(doc(db, "programs", id));
      if (programDoc.exists()) {
        const data = programDoc.data();
        programs.push({ id, ...data });
        total += (data.feeCents as number);
      }
    }

    setSelectedPrograms(programs);
    setTotalAmount(total);
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      // Create checkout session
      const response = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationItemId: "temp_id", // In real app, create application item first
          amountCents: totalAmount,
          currency: "USD",
        }),
      });

      const { sessionUrl } = await response.json();
      
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMonCashPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/moncash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationItemId: "temp_id",
          amountCents: totalAmount,
          currency: "HTG",
        }),
      });

      const { paymentUrl } = await response.json();
      
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>Complete payment for application fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Selected Programs</h3>
          {selectedPrograms.map((program) => (
            <div key={program.id} className="flex justify-between py-2">
              <span>{program.name}</span>
              <span>
                {program.currency} {(program.feeCents / 100).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>USD {(totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStripePayment}
            disabled={loading}
            className="w-full"
          >
            {t("payWithStripe")}
          </Button>
          <Button
            onClick={handleMonCashPayment}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {t("payWithMonCash")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext} variant="secondary" className="flex-1">
            Skip Payment (for testing)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
