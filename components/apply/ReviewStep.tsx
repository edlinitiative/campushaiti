"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReviewStepProps {
  onBack: () => void;
}

export default function ReviewStep({ onBack }: ReviewStepProps) {
  const t = useTranslations("apply.review");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      // Create application
      const applicationRef = await addDoc(collection(db, "applications"), {
        applicantUid: user.uid,
        status: "SUBMITTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create application items for each selected program
      const programIds = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
      
      for (const programId of programIds) {
        await addDoc(collection(db, "applicationItems"), {
          applicationId: applicationRef.id,
          programId,
          status: "SUBMITTED",
          checklist: {
            profileComplete: true,
            documentsUploaded: true,
            essaysSubmitted: true,
            paymentReceived: false,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Clear localStorage
      localStorage.removeItem("selectedPrograms");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>Review your application before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Please review all your information carefully. Once submitted, you cannot make changes to your application.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Application Summary</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Profile completed</li>
              <li>Documents uploaded</li>
              <li>Programs selected</li>
              <li>Payment processed (if applicable)</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Submitting..." : t("confirmSubmit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
