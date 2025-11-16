"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { collection, addDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
    const user = auth.currentUser;
    if (!user) {
      setError("Not authenticated");
      setPreparingData(false);
      return;
    }

    try {
      // 1. Fetch user data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // 2. Fetch profile data
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));
      const profileData = profileDoc.data();

      // 3. Fetch documents
      const docsQuery = query(collection(db, "documents"), where("ownerUid", "==", user.uid));
      const docsSnapshot = await getDocs(docsQuery);
      const documents = docsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // 4. Fetch selected programs with university data
      const programIds = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
      if (programIds.length === 0) {
        setError("No programs selected");
        setPreparingData(false);
        return;
      }

      const programsData = [];
      for (const programId of programIds) {
        const programDoc = await getDoc(doc(db, "programs", programId));
        if (programDoc.exists()) {
          const program = { id: programDoc.id, ...programDoc.data() };
          
          // Fetch university data for this program
          const universityDoc = await getDoc(doc(db, "universities", program.universityId));
          const university = universityDoc.exists() ? universityDoc.data() : null;
          
          programsData.push({
            ...program,
            universityName: university?.name || "Unknown University",
          });
        }
      }

      setApplicationData({
        user: {
          uid: user.uid,
          email: user.email || "",
          name: userData?.name || "",
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
        documents: documents.map(d => d.id),
        programs: programsData,
      });

      setPreparingData(false);
    } catch (err) {
      console.error("Error preparing application data:", err);
      setError("Failed to prepare application data");
      setPreparingData(false);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !applicationData) return;

    setLoading(true);
    setError(null);

    try {
      // Create parent application
      const applicationRef = await addDoc(collection(db, "applications"), {
        applicantUid: user.uid,
        status: "SUBMITTED",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create application items for each selected program
      for (const program of applicationData.programs) {
        await addDoc(collection(db, "applicationItems"), {
          // Application reference
          applicationId: applicationRef.id,
          programId: program.id,
          
          // University/Program info (denormalized)
          universityId: program.universityId,
          universityName: program.universityName,
          programName: program.name,
          programDegree: program.degree,
          
          // Applicant info (denormalized)
          applicantUid: user.uid,
          applicantName: applicationData.user.name,
          applicantEmail: applicationData.user.email,
          applicantPhone: applicationData.user.phone,
          
          // Profile data
          personalStatement: applicationData.profile.personalStatement,
          nationality: applicationData.profile.nationality,
          birthDate: applicationData.profile.birthDate,
          
          // Education
          education: applicationData.profile.education,
          
          // Documents
          documentIds: applicationData.documents,
          
          // Status
          status: "SUBMITTED",
          checklist: {
            profileComplete: true,
            documentsUploaded: applicationData.documents.length > 0,
            essaysSubmitted: !!applicationData.profile.personalStatement,
            customQuestionsAnswered: false, // TODO: Implement custom questions
            paymentReceived: false, // Will be updated by payment webhook
          },
          
          // Timestamps
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Clear localStorage
      localStorage.removeItem("selectedPrograms");

      // TODO: Send email notification to student
      // TODO: Send email notification to universities

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Submission failed. Please try again.");
      setLoading(false);
    }
  };

  if (preparingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>Preparing your application...</CardDescription>
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
            <AlertDescription>{error || "Failed to load application data"}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onBack}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

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

        {/* Application Summary */}
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Applicant Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {applicationData.user.name || "Not provided"}</p>
              <p><strong>Email:</strong> {applicationData.user.email}</p>
              <p><strong>Phone:</strong> {applicationData.user.phone || "Not provided"}</p>
              <p><strong>Nationality:</strong> {applicationData.profile.nationality || "Not provided"}</p>
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Education Background</h3>
            <div className="space-y-2 text-sm">
              <p><strong>School:</strong> {applicationData.profile.education.schoolName || "Not provided"}</p>
              <p><strong>Graduation Year:</strong> {applicationData.profile.education.graduationYear || "Not provided"}</p>
              {applicationData.profile.education.gpa && (
                <p><strong>GPA:</strong> {applicationData.profile.education.gpa}</p>
              )}
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Documents</h3>
            <p className="text-sm">
              {applicationData.documents.length} document(s) uploaded
            </p>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Selected Programs</h3>
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
              <h3 className="font-semibold mb-2">Personal Statement</h3>
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
          <Button variant="outline" onClick={onBack} disabled={loading}>Back</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
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
