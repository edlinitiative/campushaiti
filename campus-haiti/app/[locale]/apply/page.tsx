"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ProfileStep from "@/components/apply/ProfileStep";
import DocumentsStep from "@/components/apply/DocumentsStep";
import ProgramsStep from "@/components/apply/ProgramsStep";
import PaymentStep from "@/components/apply/PaymentStep";
import ReviewStep from "@/components/apply/ReviewStep";

export default function ApplyPage() {
  const t = useTranslations("apply");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("profile");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const steps = ["profile", "documents", "programs", "payment", "review"];
    const currentIndex = steps.indexOf(currentStep);
    setProgress(((currentIndex + 1) / steps.length) * 100);
  }, [currentStep]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <Progress value={progress} className="mt-4" />
        </div>

        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t("steps.profile")}</TabsTrigger>
            <TabsTrigger value="documents">{t("steps.documents")}</TabsTrigger>
            <TabsTrigger value="programs">{t("steps.programs")}</TabsTrigger>
            <TabsTrigger value="payment">{t("steps.payment")}</TabsTrigger>
            <TabsTrigger value="review">{t("steps.review")}</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <ProfileStep onNext={() => setCurrentStep("documents")} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsStep 
                onNext={() => setCurrentStep("programs")}
                onBack={() => setCurrentStep("profile")}
              />
            </TabsContent>
            <TabsContent value="programs">
              <ProgramsStep 
                onNext={() => setCurrentStep("payment")}
                onBack={() => setCurrentStep("documents")}
              />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentStep 
                onNext={() => setCurrentStep("review")}
                onBack={() => setCurrentStep("programs")}
              />
            </TabsContent>
            <TabsContent value="review">
              <ReviewStep onBack={() => setCurrentStep("payment")} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
