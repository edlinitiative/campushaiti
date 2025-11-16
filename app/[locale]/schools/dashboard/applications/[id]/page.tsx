"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [demoMode, setDemoMode] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      // TODO: Fetch application from API
      // For now, using mock data
      setDemoMode(true); // Always in demo mode until API is implemented
      setApplication({
        id: applicationId,
        applicantName: "Jean Baptiste",
        applicantEmail: "jean.baptiste@email.com",
        program: "Computer Science - Bachelor",
        submittedAt: "2025-11-10T14:30:00Z",
        status: "UNDER_REVIEW",
        personalInfo: {
          fullName: "Jean Baptiste",
          email: "jean.baptiste@email.com",
          phone: "+509 1234 5678",
          dateOfBirth: "2000-05-15",
          address: "Port-au-Prince, Haiti",
        },
        education: {
          schoolName: "Lycée Alexandre Pétion",
          graduationYear: "2018",
          gpa: "3.8",
        },
        documents: [
          { name: "Transcript", url: "#", uploadedAt: "2025-11-10T14:00:00Z" },
          { name: "ID Card", url: "#", uploadedAt: "2025-11-10T14:05:00Z" },
        ],
        customAnswers: [
          { question: "Why do you want to study Computer Science?", answer: "I have a passion for technology..." },
          { question: "What are your career goals?", answer: "I aim to become a software engineer..." },
        ],
        checklist: {
          personalInfoCompleted: true,
          educationCompleted: true,
          documentsUploaded: true,
          customQuestionsAnswered: true,
        },
        reviewNotes: "",
      });
      setReviewNotes(application?.reviewNotes || "");
    } catch (err) {
      console.error("Error loading application:", err);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/schools/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewNotes }),
      });

      if (response.ok) {
        setApplication({ ...application, status: newStatus });
        alert("Application status updated successfully");
      } else {
        alert("Failed to update application");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      alert("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "UNDER_REVIEW":
        return "bg-amber-100 text-amber-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Application not found</p>
            <Button className="mt-4" asChild>
              <Link href="/schools/dashboard/applications">← Back to Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {demoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800 mb-2">
                You&apos;re viewing a sample application. To review real applications, please{' '}
                <Link href="/auth/signin" className="underline font-medium">sign in</Link>
                {' '}or{' '}
                <Link href="/schools/register" className="underline font-medium">register your institution</Link>.
              </p>
              <p className="text-xs text-amber-700">
                This demo shows how you can review applications in detail and manage their status.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/schools/dashboard/applications">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{application.applicantName}</CardTitle>
                  <CardDescription>{application.program}</CardDescription>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Submitted: {new Date(application.submittedAt).toLocaleString()}
              </p>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{application.personalInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{application.personalInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{application.personalInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(application.personalInfo.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{application.personalInfo.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Name</p>
                  <p className="font-medium">{application.education.schoolName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graduation Year</p>
                  <p className="font-medium">{application.education.graduationYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="font-medium">{application.education.gpa}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          {application.customAnswers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.customAnswers.map((item: any, index: number) => (
                  <div key={index}>
                    <p className="font-medium text-sm mb-1">{item.question}</p>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {application.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="default"
                onClick={() => handleUpdateStatus("ACCEPTED")}
                disabled={updating || application.status === "ACCEPTED"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Application
              </Button>
              
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={updating || application.status === "REJECTED"}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                disabled={updating || application.status === "UNDER_REVIEW"}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Under Review
              </Button>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Review Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={5}
              />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  handleUpdateStatus(application.status);
                }}
                disabled={updating}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Application Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(application.checklist).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
