"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, DollarSign, AlertCircle, Download, User, GraduationCap, MapPin, Phone, Mail, Calendar, FileCheck, Activity, Upload } from "lucide-react";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { 
  generateAcceptanceLetter, 
  generateRejectionLetter, 
  generatePaymentReceipt, 
  generateInvoice 
} from "@/lib/pdf-templates";

export default function ApplicationDetailPage() {
  const t = useTranslations("schools.applicationDetail");
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [demoMode, setDemoMode] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  // Generate activity log from application data
  const generateActivityLog = (app: any) => {
    const activities = [];

    // Application submitted
    activities.push({
      id: 1,
      type: 'submission',
      title: t("timeline.applicationSubmitted"),
      description: t("timeline.applicationSubmittedDesc", { name: app.applicantName, program: app.program }),
      timestamp: app.submittedAt || app.createdAt,
      icon: FileText,
      color: 'blue'
    });

    // Documents uploaded
    if (app.documentIds && app.documentIds.length > 0) {
      activities.push({
        id: 2,
        type: 'documents',
        title: t("timeline.documentsUploaded"),
        description: t("timeline.documentsUploadedDesc", { count: app.documentIds.length }),
        timestamp: app.submittedAt || app.createdAt,
        icon: Upload,
        color: 'purple'
      });
    }

    // Payment received
    if (app.checklist?.paymentReceived) {
      activities.push({
        id: 3,
        type: 'payment',
        title: t("timeline.paymentReceived"),
        description: t("timeline.paymentReceivedDesc", { 
          amount: (app.feePaidCents / 100).toFixed(2), 
          currency: app.feePaidCurrency || 'USD' 
        }),
        timestamp: app.updatedAt || app.createdAt,
        icon: DollarSign,
        color: 'green'
      });
    }

    // Status changes
    if (app.status !== 'SUBMITTED') {
      const statusConfig: any = {
        'UNDER_REVIEW': { titleKey: 'timeline.statusUnderReview', color: 'amber', icon: Clock },
        'ACCEPTED': { titleKey: 'timeline.statusAccepted', color: 'green', icon: CheckCircle },
        'REJECTED': { titleKey: 'timeline.statusRejected', color: 'red', icon: XCircle },
        'WAITLISTED': { titleKey: 'timeline.statusWaitlisted', color: 'orange', icon: Clock }
      };

      const config = statusConfig[app.status] || { titleKey: 'timeline.statusUpdated' };
      activities.push({
        id: 4,
        type: 'status',
        title: t(config.titleKey),
        description: t("timeline.statusChangedDesc", { status: t(`status.${app.status}`) }),
        timestamp: app.updatedAt || app.createdAt,
        icon: config.icon || Activity,
        color: config.color || 'gray'
      });
    }

    // Sort by timestamp descending
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const loadApplication = async () => {
    try {
      // Fetch application from Firestore
      const response = await fetch(`/api/schools/applications/${applicationId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.application) {
          const app = data.application;
          setApplication({
            id: app.id,
            applicantName: app.applicantName || "Unknown",
            applicantEmail: app.applicantEmail || "",
            applicantPhone: app.applicantPhone || "",
            program: `${app.programName || "Unknown Program"} - ${app.programDegree || ""}`,
            universityName: app.universityName || "",
            submittedAt: app.submittedAt || new Date().toISOString(),
            status: app.status || "SUBMITTED",
            
            // Personal info
            gender: app.gender || "",
            birthPlace: app.birthPlace || "",
            idNumber: app.idNumber || "",
            whatsapp: app.whatsapp || "",
            nationality: app.nationality || "",
            
            // Address
            address: app.address || "",
            city: app.city || "",
            department: app.department || "",
            country: app.country || "",
            
            // Parent info
            fatherName: app.fatherName || "",
            fatherPhone: app.fatherPhone || "",
            fatherOccupation: app.fatherOccupation || "",
            motherName: app.motherName || "",
            motherPhone: app.motherPhone || "",
            motherOccupation: app.motherOccupation || "",
            guardianName: app.guardianName || "",
            guardianPhone: app.guardianPhone || "",
            guardianRelationship: app.guardianRelationship || "",
            
            // Emergency
            emergencyName: app.emergencyName || "",
            emergencyPhone: app.emergencyPhone || "",
            emergencyRelationship: app.emergencyRelationship || "",
            
            // Education
            lastSchoolName: app.lastSchoolName || "",
            lastSchoolCity: app.lastSchoolCity || "",
            graduationYear: app.graduationYear || "",
            diplomaType: app.diplomaType || "",
            fieldOfStudy: app.fieldOfStudy || "",
            gpa: app.gpa || "",
            hasBaccalaureat: app.hasBaccalaureat || "",
            baccalaureatSeries: app.baccalaureatSeries || "",
            
            // Essays
            personalStatement: app.personalStatement || "",
            careerGoals: app.careerGoals || "",
            whyThisUniversity: app.whyThisUniversity || "",
            
            personalInfo: {
              fullName: app.applicantName || "",
              email: app.applicantEmail || "",
              phone: app.applicantPhone || "",
              dateOfBirth: app.birthDate || "",
              address: app.nationality || "",
            },
            education: {
              schoolName: app.lastSchoolName || "",
              city: app.lastSchoolCity || "",
              graduationYear: app.graduationYear || "",
              gpa: app.gpa || "",
              diplomaType: app.diplomaType || "",
              fieldOfStudy: app.fieldOfStudy || "",
              hasBaccalaureat: app.hasBaccalaureat || "",
              baccalaureatSeries: app.baccalaureatSeries || "",
            },
            documents: app.documents || [],
            documentIds: app.documentIds || [],
            customAnswers: app.customAnswers || [],
            programAnswers: app.programAnswers || {},
            checklist: app.checklist || {
              personalInfoCompleted: false,
              educationCompleted: false,
              documentsUploaded: false,
              customQuestionsAnswered: false,
            },
            reviewNotes: app.reviewNotes || "",
            feePaidCents: app.feePaidCents || 0,
            feePaidCurrency: app.feePaidCurrency || "HTG",
          });
          setReviewNotes(app.reviewNotes || "");
          setActivityLog(generateActivityLog(app));
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
        universityName: "Université d'État d'Haïti",
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
      setReviewNotes("");
      setActivityLog(generateActivityLog({
        applicantName: "Jean Baptiste",
        program: "Computer Science - Bachelor",
        submittedAt: "2025-11-10T14:30:00Z",
        createdAt: "2025-11-10T14:30:00Z",
        updatedAt: "2025-11-10T16:00:00Z",
        status: "UNDER_REVIEW",
        documentIds: ["doc1", "doc2"],
        checklist: { paymentReceived: true },
        feePaidCents: 5000,
        feePaidCurrency: "HTG"
      }));
    } catch (err) {
      console.error("Error loading application:", err);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    // Handle demo mode
    if (demoMode) {
      alert("Demo Mode: Status changes are not saved. Please sign in to manage real applications.");
      setApplication({ ...application, status: newStatus });
      return;
    }

    if (!confirm(`Change status to ${newStatus.replace(/_/g, ' ')}?`)) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/schools/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reviewNotes }),
      });

      if (response.ok) {
        const updatedApp = { ...application, status: newStatus };
        setApplication(updatedApp);
        setActivityLog(generateActivityLog(updatedApp));
        alert(`Application status updated to ${newStatus.replace(/_/g, ' ')}`);
        
        // Send status update email to student
        try {
          const dashboardUrl = `${window.location.origin}/dashboard`;
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: application.personalInfo.email,
              template: 'applicationStatusUpdate',
              data: {
                studentName: application.personalInfo.fullName,
                programName: application.program,
                universityName: application.universityName,
                status: newStatus,
                message: reviewNotes || undefined,
                dashboardUrl
              }
            })
          });
        } catch (emailErr) {
          console.error('Failed to send status update email:', emailErr);
          // Don't block status update if email fails
        }
      } else {
        const error = await response.json();
        alert(`Failed to update application: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error updating application:", err);
      alert("An error occurred while updating the application");
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
      pdf.rect(0, 0, pdf.internal.pageSize.width, 50, 'F');
      pdf.setTextColor(255, 255, 255);
      
      // School name at the top
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const schoolName = application.universityName || application.program?.split(' - ')[0] || "University";
      pdf.text(schoolName, margin, 15);
      
      // Main title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("APPLICATION DOSSIER", margin, 35);
      
      pdf.setTextColor(0, 0, 0);
      yPos = 60;

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
              {t("backToApplications")}
            </Link>
          </Button>
          <Button onClick={handleDownloadDossier} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("downloadCompleteDossier")}
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
                  {t(`status.${application.status}`)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("submitted")}: {new Date(application.submittedAt).toLocaleString()}
              </p>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("personalInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("fullName")}</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.fullName || application.applicantName || t("notProvided")}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("email")}</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.email || application.applicantEmail || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("gender")}</p>
                  <p className="font-medium">{application.gender || t("notProvided")}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("dateOfBirth")}</p>
                  </div>
                  <p className="font-medium">
                    {application.personalInfo?.dateOfBirth 
                      ? new Date(application.personalInfo.dateOfBirth).toLocaleDateString()
                      : t("notProvided")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("placeOfBirth")}</p>
                  <p className="font-medium">{application.birthPlace || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("idNumber")}</p>
                  <p className="font-medium">{application.idNumber || t("notProvided")}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("phone")}</p>
                  </div>
                  <p className="font-medium">{application.personalInfo?.phone || application.applicantPhone || t("notProvided")}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("whatsapp")}</p>
                  </div>
                  <p className="font-medium">{application.whatsapp || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("nationality")}</p>
                  <p className="font-medium">{application.nationality || application.personalInfo?.address || t("notProvided")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t("addressInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t("streetAddress")}</p>
                  <p className="font-medium">{application.address || application.addressDetails?.street || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("city")}</p>
                  <p className="font-medium">{application.city || application.addressDetails?.city || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("department")}</p>
                  <p className="font-medium">{application.department || application.addressDetails?.department || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("country")}</p>
                  <p className="font-medium">{application.country || application.addressDetails?.country || t("notProvided")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent/Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("parentGuardianInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Father */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">{t("fatherName")}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fullName")}</p>
                    <p className="font-medium">{application.fatherName || application.parentInfo?.fatherName || t("notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("phone")}</p>
                    <p className="font-medium">{application.fatherPhone || application.parentInfo?.fatherPhone || t("notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fatherOccupation")}</p>
                    <p className="font-medium">{application.fatherOccupation || application.parentInfo?.fatherOccupation || t("notProvided")}</p>
                  </div>
                </div>
              </div>
              
              {/* Mother */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">{t("motherName")}</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("fullName")}</p>
                    <p className="font-medium">{application.motherName || application.parentInfo?.motherName || t("notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("phone")}</p>
                    <p className="font-medium">{application.motherPhone || application.parentInfo?.motherPhone || t("notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("motherOccupation")}</p>
                    <p className="font-medium">{application.motherOccupation || application.parentInfo?.motherOccupation || t("notProvided")}</p>
                  </div>
                </div>
              </div>
              
              {/* Guardian (if applicable) */}
              {(application.guardianName || application.parentInfo?.guardianName) && (
                <div>
                  <h4 className="font-semibold mb-3">{t("guardianName")}</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fullName")}</p>
                      <p className="font-medium">{application.guardianName || application.parentInfo?.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("phone")}</p>
                      <p className="font-medium">{application.guardianPhone || application.parentInfo?.guardianPhone || t("notProvided")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("relationship")}</p>
                      <p className="font-medium">{application.guardianRelationship || application.parentInfo?.guardianRelationship || t("notProvided")}</p>
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
                {t("emergencyContact")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("emergencyName")}</p>
                  <p className="font-medium">{application.emergencyName || application.emergencyContact?.name || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("emergencyPhone")}</p>
                  <p className="font-medium">{application.emergencyPhone || application.emergencyContact?.phone || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("relationship")}</p>
                  <p className="font-medium">{application.emergencyRelationship || application.emergencyContact?.relationship || t("notProvided")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {t("educationBackground")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("schoolName")}</p>
                  <p className="font-medium">{application.education?.schoolName || application.lastSchoolName || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("schoolCity")}</p>
                  <p className="font-medium">{application.education?.city || application.lastSchoolCity || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("graduationYear")}</p>
                  <p className="font-medium">{application.education?.graduationYear || application.graduationYear || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("diplomaType")}</p>
                  <p className="font-medium">{application.education?.diplomaType || application.diplomaType || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("fieldOfStudy")}</p>
                  <p className="font-medium">{application.education?.fieldOfStudy || application.fieldOfStudy || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("gpaAverage")}</p>
                  <p className="font-medium">{application.education?.gpa || application.gpa || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("baccalaureat")}</p>
                  <p className="font-medium">{application.education?.hasBaccalaureat || application.hasBaccalaureat || t("notProvided")}</p>
                </div>
                {(application.education?.baccalaureatSeries || application.baccalaureatSeries) && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("baccalaureatSeries")}</p>
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
                <CardTitle>{t("essaysPersonalStatements")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(application.personalStatement || application.essays?.personalStatement) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">{t("personalStatement")}</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.personalStatement || application.essays?.personalStatement}</p>
                  </div>
                )}
                {(application.essays?.careerGoals || application.careerGoals) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">{t("careerGoals")}</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{application.essays?.careerGoals || application.careerGoals}</p>
                  </div>
                )}
                {(application.essays?.whyThisUniversity || application.whyThisUniversity) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">{t("whyThisUniversity")}</h4>
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
                <CardTitle>{t("customQuestions")}</CardTitle>
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
                <CardTitle>{t("programSpecificQuestions")}</CardTitle>
                <CardDescription>{t("programSpecificQuestionsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(application.programAnswers).map(([questionId, answer]: [string, any]) => (
                  <div key={questionId} className="border-l-2 border-primary pl-4">
                    <p className="font-medium text-sm mb-1 text-muted-foreground">{t("question")} {questionId}</p>
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
                {t("feeInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {application.feePaidCents ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("applicationFee")}:</span>
                      <span className="font-semibold">
                        {(application.feePaidCents / 100).toFixed(2)} {application.feePaidCurrency || "HTG"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.checklist?.paymentReceived ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">{t("paymentStatus")}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-600 font-medium">{t("paidOn")}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("noFeeInfo")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("documents")} ({application.documentIds?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documentIds && application.documentIds.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {application.documentIds.length} {t("documentsUploaded")}
                  </p>
                  {/* TODO: Fetch and display actual documents */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      {t("documentViewingSoon")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  {t("noDocumentsUploaded")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t("activityTimeline")}
              </CardTitle>
              <CardDescription>
                {t("completeHistory")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLog.length > 0 ? (
                <div className="space-y-4">
                  {activityLog.map((activity, index) => {
                    const IconComponent = activity.icon;
                    const colorClasses: any = {
                      blue: 'bg-blue-100 text-blue-600 border-blue-200',
                      green: 'bg-green-100 text-green-600 border-green-200',
                      red: 'bg-red-100 text-red-600 border-red-200',
                      amber: 'bg-amber-100 text-amber-600 border-amber-200',
                      orange: 'bg-orange-100 text-orange-600 border-orange-200',
                      purple: 'bg-purple-100 text-purple-600 border-purple-200',
                      gray: 'bg-gray-100 text-gray-600 border-gray-200'
                    };

                    return (
                      <div key={activity.id} className="relative flex gap-4">
                        {/* Timeline line */}
                        {index < activityLog.length - 1 && (
                          <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
                        )}
                        
                        {/* Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${colorClasses[activity.color] || colorClasses.gray}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t("noActivityRecorded")}</span>
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
              <CardTitle>{t("reviewActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="default"
                onClick={() => handleUpdateStatus("ACCEPTED")}
                disabled={updating || application.status === "ACCEPTED"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("acceptApplication")}
              </Button>
              
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleUpdateStatus("WAITLISTED")}
                disabled={updating || application.status === "WAITLISTED"}
              >
                <Clock className="w-4 h-4 mr-2" />
                {t("addToWaitlist")}
              </Button>
              
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={updating || application.status === "REJECTED"}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t("rejectApplication")}
              </Button>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                disabled={updating || application.status === "UNDER_REVIEW"}
              >
                <Clock className="w-4 h-4 mr-2" />
                {t("markUnderReview")}
              </Button>
            </CardContent>
          </Card>

          {/* Document Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                {t("generateDocuments")}
              </CardTitle>
              <CardDescription>
                {t("createOfficialDocuments")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  const pdf = generateAcceptanceLetter(
                    {
                      name: application.universityName || "University",
                      address: "Port-au-Prince, Haiti",
                      email: "admissions@university.edu.ht",
                      phone: "+509 1234 5678"
                    },
                    {
                      name: application.personalInfo?.fullName || application.applicantName,
                      email: application.personalInfo?.email || application.applicantEmail,
                      address: application.address?.fullAddress || ""
                    },
                    {
                      name: application.program,
                      degree: application.programDegree || "",
                      startDate: "September 2026"
                    },
                    application.id
                  );
                  pdf.save(`acceptance-letter-${application.id}.pdf`);
                }}
                disabled={application.status !== "ACCEPTED"}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("acceptanceLetter")}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  const pdf = generateRejectionLetter(
                    {
                      name: application.universityName || "University",
                      address: "Port-au-Prince, Haiti",
                      email: "admissions@university.edu.ht",
                      phone: "+509 1234 5678"
                    },
                    {
                      name: application.personalInfo?.fullName || application.applicantName,
                      email: application.personalInfo?.email || application.applicantEmail,
                      address: application.address?.fullAddress || ""
                    },
                    {
                      name: application.program,
                      degree: application.programDegree || ""
                    },
                    application.id
                  );
                  pdf.save(`rejection-letter-${application.id}.pdf`);
                }}
                disabled={application.status !== "REJECTED"}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("rejectionLetter")}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  const pdf = generateInvoice(
                    {
                      name: application.universityName || "University",
                      address: "Port-au-Prince, Haiti",
                      email: "admissions@university.edu.ht",
                      phone: "+509 1234 5678"
                    },
                    {
                      name: application.personalInfo?.fullName || application.applicantName,
                      email: application.personalInfo?.email || application.applicantEmail,
                      address: application.address?.fullAddress || ""
                    },
                    {
                      name: application.program,
                      degree: application.programDegree || ""
                    },
                    `INV-${application.id}`,
                    50.00,
                    "USD",
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  );
                  pdf.save(`invoice-${application.id}.pdf`);
                }}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {t("generateInvoice")}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  const pdf = generatePaymentReceipt(
                    {
                      name: application.universityName || "University",
                      address: "Port-au-Prince, Haiti",
                      email: "admissions@university.edu.ht",
                      phone: "+509 1234 5678"
                    },
                    {
                      name: application.personalInfo?.fullName || application.applicantName,
                      email: application.personalInfo?.email || application.applicantEmail
                    },
                    {
                      name: application.program,
                      degree: application.programDegree || ""
                    },
                    {
                      amount: 50.00,
                      currency: "USD",
                      transactionId: `TXN-${application.id}`,
                      date: new Date().toLocaleDateString(),
                      method: "Online Payment"
                    }
                  );
                  pdf.save(`receipt-${application.id}.pdf`);
                }}
                disabled={!application.checklist?.paymentReceived}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {t("paymentReceipt")}
              </Button>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t("reviewNotes")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={t("addNotesPlaceholder")}
                rows={5}
              />
              <Button
                className="w-full"
                variant="outline"
                onClick={async () => {
                  if (demoMode) {
                    alert(t("demoModeNotes"));
                    return;
                  }
                  
                  setUpdating(true);
                  try {
                    const response = await fetch(`/api/schools/applications/${applicationId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reviewNotes }),
                    });

                    if (response.ok) {
                      setApplication({ ...application, reviewNotes });
                      alert(t("notesSaved"));
                    } else {
                      const error = await response.json();
                      alert(`Failed to save notes: ${error.error || 'Unknown error'}`);
                    }
                  } catch (err) {
                    console.error("Error saving notes:", err);
                    alert("An error occurred while saving notes");
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
              >
                {t("saveNotes")}
              </Button>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>{t("applicationChecklist")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(application.checklist).map(([key, value]) => {
                // Map checklist keys to translation keys
                const checklistKeyMap: Record<string, string> = {
                  'profileComplete': 'checklist.profileComplete',
                  'documentsUploaded': 'checklist.documentsUploaded',
                  'essaysSubmitted': 'checklist.essaysSubmitted',
                  'customQuestionsAnswered': 'checklist.customQuestionsAnswered',
                  'paymentReceived': 'checklist.paymentReceived',
                  'personalInfoCompleted': 'checklist.personalInfoCompleted',
                  'educationCompleted': 'checklist.educationCompleted',
                };
                
                return (
                  <div key={key} className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">
                      {checklistKeyMap[key] ? t(checklistKeyMap[key]) : key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
