"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, DollarSign, AlertCircle, Download, User, GraduationCap, MapPin, Phone, Mail, Calendar } from "lucide-react";
import JSZip from "jszip";
import jsPDF from "jspdf";

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
      // Fetch application from Firestore
      const response = await fetch(`/api/schools/applications/${applicationId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.application) {
          setApplication({
            id: data.application.id,
            applicantName: data.application.applicantName || "Unknown",
            applicantEmail: data.application.applicantEmail || "",
            program: `${data.application.programName || "Unknown Program"} - ${data.application.programDegree || ""}`,
            submittedAt: data.application.submittedAt || new Date().toISOString(),
            status: data.application.status || "SUBMITTED",
            personalInfo: {
              fullName: data.application.applicantName || "",
              email: data.application.applicantEmail || "",
              phone: data.application.applicantPhone || "",
              dateOfBirth: data.application.birthDate || "",
              address: data.application.nationality || "",
            },
            education: data.application.education || {
              schoolName: "",
              graduationYear: "",
              gpa: "",
            },
            documents: [], // TODO: Fetch documents by documentIds
            customAnswers: data.application.customAnswers || [],
            checklist: data.application.checklist || {
              personalInfoCompleted: false,
              educationCompleted: false,
              documentsUploaded: false,
              customQuestionsAnswered: false,
            },
            reviewNotes: data.application.reviewNotes || "",
            personalStatement: data.application.personalStatement || "",
          });
          setReviewNotes(data.application.reviewNotes || "");
          setDemoMode(false);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to demo mode if API fails
      console.log("Failed to fetch application, using demo mode");
      setDemoMode(true);
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

  const handleDownloadDossier = async () => {
    try {
      const zip = new JSZip();
      
      // Create PDF
      const pdf = new jsPDF();
      let yPos = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = 170;

      // Helper function to add text with auto page break
      const addText = (text: string, fontSize = 10, isBold = false, indent = 0) => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        
        const lines = pdf.splitTextToSize(text, maxWidth - indent);
        lines.forEach((line: string) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, margin + indent, yPos);
          yPos += lineHeight;
        });
      };

      const addSection = (title: string) => {
        yPos += 3;
        addText(title, 14, true);
        yPos += 2;
      };

      const addField = (label: string, value: string) => {
        addText(`${label}: ${value || 'Not provided'}`, 10, false);
      };

      // Header
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, pdf.internal.pageSize.width, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("APPLICATION DOSSIER", margin, 25);
      pdf.setTextColor(0, 0, 0);
      yPos = 50;

      // Application Overview
      addSection("Application Overview");
      addField("Applicant", application.applicantName);
      addField("Program", application.program);
      addField("Status", application.status);
      addField("Submitted", new Date(application.submittedAt).toLocaleString());

      // Personal Information
      addSection("Personal Information");
      addField("Full Name", application.personalInfo?.fullName || application.applicantName);
      addField("Email", application.personalInfo?.email || application.applicantEmail);
      addField("Gender", application.gender);
      addField("Phone", application.personalInfo?.phone);
      addField("WhatsApp", application.whatsapp);
      addField("Date of Birth", application.personalInfo?.dateOfBirth);
      addField("Place of Birth", application.birthPlace);
      addField("ID Number", application.idNumber);
      addField("Nationality", application.nationality);

      // Address Information
      addSection("Address Information");
      addField("Street Address", application.address || application.addressDetails?.street);
      addField("City", application.city || application.addressDetails?.city);
      addField("Department/State", application.department || application.addressDetails?.department);
      addField("Country", application.country || application.addressDetails?.country);

      // Parent/Guardian Information
      addSection("Parent & Guardian Information");
      addText("Father's Information:", 11, true);
      addField("  Name", application.fatherName || application.parentInfo?.fatherName);
      addField("  Phone", application.fatherPhone || application.parentInfo?.fatherPhone);
      addField("  Occupation", application.fatherOccupation || application.parentInfo?.fatherOccupation);
      
      yPos += 2;
      addText("Mother's Information:", 11, true);
      addField("  Name", application.motherName || application.parentInfo?.motherName);
      addField("  Phone", application.motherPhone || application.parentInfo?.motherPhone);
      addField("  Occupation", application.motherOccupation || application.parentInfo?.motherOccupation);

      if (application.guardianName || application.parentInfo?.guardianName) {
        yPos += 2;
        addText("Guardian's Information:", 11, true);
        addField("  Name", application.guardianName || application.parentInfo?.guardianName);
        addField("  Phone", application.guardianPhone || application.parentInfo?.guardianPhone);
        addField("  Relationship", application.guardianRelationship || application.parentInfo?.guardianRelationship);
      }

      // Emergency Contact
      addSection("Emergency Contact");
      addField("Name", application.emergencyName || application.emergencyContact?.name);
      addField("Phone", application.emergencyPhone || application.emergencyContact?.phone);
      addField("Relationship", application.emergencyRelationship || application.emergencyContact?.relationship);

      // Education Background
      addSection("Education Background");
      addField("School Name", application.education?.schoolName || application.lastSchoolName);
      addField("School City", application.education?.city || application.lastSchoolCity);
      addField("Graduation Year", application.education?.graduationYear || application.graduationYear);
      addField("Diploma Type", application.education?.diplomaType || application.diplomaType);
      addField("Field of Study", application.education?.fieldOfStudy || application.fieldOfStudy);
      addField("GPA/Average", application.education?.gpa || application.gpa);
      addField("Baccalauréat", application.education?.hasBaccalaureat || application.hasBaccalaureat);
      if (application.education?.baccalaureatSeries || application.baccalaureatSeries) {
        addField("Baccalauréat Series", application.education?.baccalaureatSeries || application.baccalaureatSeries);
      }

      // Essays
      if (application.personalStatement || application.essays?.personalStatement) {
        addSection("Personal Statement");
        addText(application.personalStatement || application.essays?.personalStatement, 9, false, 5);
      }

      if (application.essays?.careerGoals || application.careerGoals) {
        addSection("Career Goals");
        addText(application.essays?.careerGoals || application.careerGoals, 9, false, 5);
      }

      if (application.essays?.whyThisUniversity || application.whyThisUniversity) {
        addSection("Why This University");
        addText(application.essays?.whyThisUniversity || application.whyThisUniversity, 9, false, 5);
      }

      // Program-Specific Questions
      if (application.customAnswers && application.customAnswers.length > 0) {
        addSection("Program-Specific Questions");
        application.customAnswers.forEach((item: any, i: number) => {
          addText(`Q${i + 1}: ${item.question}`, 10, true);
          addText(`A: ${item.answer}`, 9, false, 5);
          yPos += 2;
        });
      }

      if (application.programAnswers) {
        addSection("Additional Program Questions");
        Object.entries(application.programAnswers).forEach(([qId, answer]) => {
          addText(`Question ID: ${qId}`, 10, true);
          addText(`Answer: ${answer}`, 9, false, 5);
          yPos += 2;
        });
      }

      // Application Checklist
      addSection("Application Checklist");
      Object.entries(application.checklist).forEach(([key, value]) => {
        const symbol = value ? '✓' : '✗';
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        addText(`${symbol} ${label}`, 10, false);
      });

      // Documents
      addSection("Documents");
      if (application.documents && application.documents.length > 0) {
        addField("Total Documents", application.documents.length.toString());
        application.documents.forEach((doc: any, i: number) => {
          addText(`${i + 1}. ${doc.name || `Document ${i + 1}`}`, 9, false, 5);
        });
      } else {
        addText("No documents uploaded", 10, false);
      }

      // Payment Information
      if (application.feePaidCents) {
        addSection("Payment Information");
        addField("Amount", `${(application.feePaidCents / 100).toFixed(2)} ${application.feePaidCurrency || 'HTG'}`);
        addField("Payment Status", application.checklist?.paymentReceived ? 'Received' : 'Pending');
      }

      // Review Notes
      if (reviewNotes) {
        addSection("Review Notes");
        addText(reviewNotes, 9, false, 5);
      }

      // Footer
      yPos = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);

      // Add PDF to ZIP
      const pdfBlob = pdf.output('blob');
      zip.file("application_dossier.pdf", pdfBlob);

      // Download documents if available
      if (application.documents && application.documents.length > 0) {
        const documentsFolder = zip.folder("documents");
        
        for (let i = 0; i < application.documents.length; i++) {
          const doc = application.documents[i];
          try {
            const response = await fetch(doc.url);
            if (response.ok) {
              const blob = await response.blob();
              const filename = doc.name || `document_${i + 1}`;
              documentsFolder?.file(filename, blob);
            }
          } catch (err) {
            console.error(`Error downloading document ${doc.name}:`, err);
          }
        }
      } else {
        zip.file("documents/README.txt", "No documents have been uploaded for this application.");
      }

      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `application_${application.applicantName.replace(/\s+/g, '_')}_${applicationId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error creating ZIP file:", err);
      alert("Failed to create download package. Please try again.");
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/schools/dashboard/applications">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
          <Button onClick={handleDownloadDossier} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Dossier (ZIP)
          </Button>
        </div>
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
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Full Name</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.fullName || application.applicantName || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.email || application.applicantEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{application.gender || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                  </div>
                  <p className="font-medium">
                    {application.personalInfo?.dateOfBirth 
                      ? new Date(application.personalInfo.dateOfBirth).toLocaleDateString()
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Place of Birth</p>
                  <p className="font-medium">{application.birthPlace || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{application.idNumber || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Phone</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.phone || application.applicantPhone || 'Not provided'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                  </div>
                  <p className="font-medium">{application.whatsapp || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{application.nationality || application.personalInfo?.address || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Street Address</p>
                  <p className="font-medium">{application.address || application.addressDetails?.street || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{application.city || application.addressDetails?.city || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department/State</p>
                  <p className="font-medium">{application.department || application.addressDetails?.department || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{application.country || application.addressDetails?.country || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent & Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Father */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Father Information</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{application.fatherName || application.parentInfo?.fatherName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{application.fatherPhone || application.parentInfo?.fatherPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{application.fatherOccupation || application.parentInfo?.fatherOccupation || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Mother */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Mother Information</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{application.motherName || application.parentInfo?.motherName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{application.motherPhone || application.parentInfo?.motherPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{application.motherOccupation || application.parentInfo?.motherOccupation || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Guardian (if applicable) */}
              {(application.guardianName || application.parentInfo?.guardianName) && (
                <div>
                  <h4 className="font-semibold mb-3">Guardian Information</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{application.guardianName || application.parentInfo?.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{application.guardianPhone || application.parentInfo?.guardianPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">{application.guardianRelationship || application.parentInfo?.guardianRelationship || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{application.emergencyName || application.emergencyContact?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{application.emergencyPhone || application.emergencyContact?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{application.emergencyRelationship || application.emergencyContact?.relationship || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Name</p>
                  <p className="font-medium">{application.education?.schoolName || application.lastSchoolName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School City</p>
                  <p className="font-medium">{application.education?.city || application.lastSchoolCity || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Graduation Year</p>
                  <p className="font-medium">{application.education?.graduationYear || application.graduationYear || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diploma Type</p>
                  <p className="font-medium">{application.education?.diplomaType || application.diplomaType || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Field of Study</p>
                  <p className="font-medium">{application.education?.fieldOfStudy || application.fieldOfStudy || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GPA / Average</p>
                  <p className="font-medium">{application.education?.gpa || application.gpa || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Baccalauréat</p>
                  <p className="font-medium">{application.education?.hasBaccalaureat || application.hasBaccalaureat || 'Not provided'}</p>
                </div>
                {(application.education?.baccalaureatSeries || application.baccalaureatSeries) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Baccalauréat Series</p>
                    <p className="font-medium">{application.education?.baccalaureatSeries || application.baccalaureatSeries}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Essays & Personal Statements */}
          {(application.personalStatement || application.essays?.personalStatement || application.essays?.careerGoals || application.essays?.whyThisUniversity || application.careerGoals || application.whyThisUniversity) && (
            <Card>
              <CardHeader>
                <CardTitle>Essays & Personal Statements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(application.personalStatement || application.essays?.personalStatement) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Personal Statement</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.personalStatement || application.essays?.personalStatement}</p>
                  </div>
                )}
                {(application.essays?.careerGoals || application.careerGoals) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Career Goals</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.essays?.careerGoals || application.careerGoals}</p>
                  </div>
                )}
                {(application.essays?.whyThisUniversity || application.whyThisUniversity) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Why This University</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.essays?.whyThisUniversity || application.whyThisUniversity}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Program-Specific Answers */}
          {application.programAnswers && Object.keys(application.programAnswers).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Program-Specific Questions</CardTitle>
                <CardDescription>Additional questions answered for this program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(application.programAnswers).map(([questionId, answer]: [string, any]) => (
                  <div key={questionId} className="border-l-2 border-primary pl-4">
                    <p className="font-medium text-sm mb-1 text-muted-foreground">Question {questionId}</p>
                    <p className="text-sm whitespace-pre-wrap">{answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Application Fee & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Application Fee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {application.feePaidCents ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {(application.feePaidCents / 100).toFixed(2)} {application.feePaidCurrency || "HTG"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.checklist?.paymentReceived ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Payment Received</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-600 font-medium">Payment Pending</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No fee information available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents ({application.documentIds?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documentIds && application.documentIds.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {application.documentIds.length} document(s) uploaded
                  </p>
                  {/* TODO: Fetch and display actual documents */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      Document viewing will be available soon. Document IDs are stored in the application.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  No documents uploaded
                </div>
              )}
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
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleUpdateStatus("WAITLISTED")}
                disabled={updating || application.status === "WAITLISTED"}
              >
                <Clock className="w-4 h-4 mr-2" />
                Add to Waitlist
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
