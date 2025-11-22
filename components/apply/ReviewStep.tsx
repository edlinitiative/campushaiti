"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ReviewStepProps {
  onBack: () => void;
}

export default function ReviewStep({ onBack }: ReviewStepProps) {
  const t = useTranslations("apply.review");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preparingData, setPreparingData] = useState(true);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prepareApplicationData();
  }, []);

  const prepareApplicationData = async () => {
    setPreparingData(true);
    setError(null);
    
    const user = auth.currentUser;
    if (!user) {
      setError(t("notAuthenticated"));
      setPreparingData(false);
      return;
    }

    try {
      console.log("Preparing application data for user:", user.uid);
      
      // 4. Load selected programs from new format (FIRST - no Firebase needed)
      const programsDataStr = localStorage.getItem("selectedProgramsData");
      console.log("Programs data from localStorage:", programsDataStr);
      
      let programsData = [];
      
      if (programsDataStr) {
        // New format - already has all data including answers
        programsData = JSON.parse(programsDataStr);
        console.log("Using new format programs:", programsData);
      } else {
        // Fallback to old format - requires API
        const programIds = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
        console.log("Fallback to old format, program IDs:", programIds);
        
        if (programIds.length === 0) {
          setError(t("noProgramsSelected"));
          setPreparingData(false);
          return;
        }

        // Fetch all programs from API
        try {
          const response = await fetch("/api/programs");
          if (!response.ok) {
            throw new Error("Failed to fetch programs");
          }
          
          const allPrograms = await response.json();
          programsData = allPrograms.filter((p: any) => programIds.includes(p.id));
        } catch (apiError) {
          console.error("Error fetching from API:", apiError);
          setError(t("cannotLoadPrograms"));
          setPreparingData(false);
          return;
        }
      }

      if (programsData.length === 0) {
        setError(t("noProgramsSelected"));
        setPreparingData(false);
        return;
      }

      // Now try to load user/profile/documents data via API
      let userData: any = {};
      let profileData: any = {};
      let documents: any[] = [];

      try {
        const response = await fetch(`/api/user/profile?userId=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          userData = data.user || {};
          profileData = data.profile || {};
          console.log("User data:", userData);
          console.log("Profile data:", profileData);
        }
      } catch (err) {
        console.warn("Could not fetch user/profile data:", err);
      }

      try {
        const response = await fetch(`/api/user/documents?userId=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          documents = data.documents || [];
          console.log("Documents:", documents);
        }
      } catch (err) {
        console.warn("Could not fetch documents:", err);
      }

      setApplicationData({
        user: {
          uid: user.uid,
          email: user.email || userData?.email || "",
          name: userData?.fullName || "",
          phone: profileData?.phone || "",
        },
        profile: {
          personalStatement: profileData?.essays?.personalStatement || "",
          nationality: profileData?.nationality || "",
          birthDate: profileData?.birthDate || null,
          education: {
            schoolName: profileData?.education?.schoolName || "",
            graduationYear: profileData?.education?.graduationYear || "",
            gpa: profileData?.education?.gpa || "",
            fieldOfStudy: profileData?.education?.fieldOfStudy || "",
          },
        },
        documents: documents.map((d: any) => d.id),
        programs: programsData,
      });

      console.log("Application data prepared successfully");
      setPreparingData(false);
    } catch (err) {
      console.error("Error preparing application data:", err);
      setError(t("errorPreparingData", {error: err instanceof Error ? err.message : 'Unknown error'}));
      setPreparingData(false);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !applicationData) return;

    setLoading(true);
    setError(null);

    try {
      // Submit application via API
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      const result = await response.json();
      const applicationId = result.applicationId;

      // Clear localStorage
      localStorage.removeItem("selectedPrograms");
      localStorage.removeItem("selectedProgramsData");

      // Send email notifications to student
      try {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        
        for (const program of applicationData.programs) {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: applicationData.user.email,
              template: 'applicationSubmitted',
              data: {
                studentName: applicationData.user.name,
                programName: program.name,
                universityName: program.universityName || 'Unknown University',
                applicationId: applicationId,
                dashboardUrl
              }
            })
          });
        }
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
        // Don't block submission if email fails
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(t("submissionFailed"));
      setLoading(false);
    }
  };

  if (preparingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("preparing")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !applicationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error || t("errorLoadingData")}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onBack}>{t("goBack")}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            {t("reviewWarning")}
          </AlertDescription>
        </Alert>

        {/* Application Summary */}
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">{t("applicantInfo")}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>{t("name")}:</strong> {applicationData.user.name || t("notProvided")}</p>
              <p><strong>{t("email")}:</strong> {applicationData.user.email}</p>
              <p><strong>{t("phone")}:</strong> {applicationData.user.phone || t("notProvided")}</p>
              <p><strong>{t("nationality")}:</strong> {applicationData.profile.nationality || t("notProvided")}</p>
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">{t("educationBackground")}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>{t("school")}:</strong> {applicationData.profile.education.schoolName || t("notProvided")}</p>
              <p><strong>{t("graduationYear")}:</strong> {applicationData.profile.education.graduationYear || t("notProvided")}</p>
              {applicationData.profile.education.gpa && (
                <p><strong>{t("gpa")}:</strong> {applicationData.profile.education.gpa}</p>
              )}
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">{t("documents")}</h3>
            <p className="text-sm">
              {t("documentsUploaded", {count: applicationData.documents.length})}
            </p>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">{t("selectedPrograms")}</h3>
            <ul className="space-y-2">
              {applicationData.programs.map((program: any) => (
                <li key={program.id} className="text-sm">
                  <strong>{program.name}</strong> ({program.degree})
                  <br />
                  <span className="text-muted-foreground">{program.universityName}</span>
                </li>
              ))}
            </ul>
          </div>

          {applicationData.profile.personalStatement && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">{t("personalStatement")}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {applicationData.profile.personalStatement}
              </p>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={loading}>{t("back")}</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("confirmSubmit")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
