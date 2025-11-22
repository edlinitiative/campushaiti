import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { ClientAuthSync } from "@/components/ClientAuthSync";
import PasskeyPrompt from "@/components/auth/PasskeyPrompt";
import ProfileCompletionPrompt from "@/components/auth/ProfileCompletionPrompt";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import { FileText, DollarSign, Bell, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    // Use as-needed locale: English doesn't need /en prefix
    const signinPath = locale === "en" ? "/auth/signin" : `/${locale}/auth/signin`;
    redirect(signinPath);
  }

  const t = await getTranslations("userDashboard");

  // Fetch applications and calculate stats
  let applications: any[] = [];
  let documents: any[] = [];
  let stats = {
    totalApplications: 0,
    submitted: 0,
    accepted: 0,
    pending: 0,
    totalPaid: 0,
    documentsUploaded: 0,
  };

  try {
    // Fetch applications
    const snapshot = await db.collection("applicationItems")
      .where("applicantUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get();
    
    applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch documents
    const docsSnapshot = await db.collection("documents")
      .where("ownerUid", "==", user.uid)
      .get();
    
    documents = docsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate stats
    stats.totalApplications = applications.length;
    stats.submitted = applications.filter(app => app.status === "SUBMITTED").length;
    stats.accepted = applications.filter(app => app.status === "ACCEPTED").length;
    stats.pending = applications.filter(app => 
      app.status === "SUBMITTED" || app.status === "UNDER_REVIEW"
    ).length;
    stats.totalPaid = applications.reduce((sum, app) => 
      sum + (app.feePaidCents || 0), 0
    );
    stats.documentsUploaded = documents.length;
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED": return CheckCircle;
      case "SUBMITTED": return Clock;
      case "UNDER_REVIEW": return Clock;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "text-green-600 bg-green-50 border-green-200";
      case "SUBMITTED": return "text-blue-600 bg-blue-50 border-blue-200";
      case "UNDER_REVIEW": return "text-amber-600 bg-amber-50 border-amber-200";
      case "REJECTED": return "text-red-600 bg-red-50 border-red-200";
      case "WAITLISTED": return "text-purple-600 bg-purple-50 border-purple-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientAuthSync />
      <ProfileCompletionPrompt />
      <PasskeyPrompt />
      <EmailVerificationBanner />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('welcomeBack')}, {user.email?.split('@')[0] || "Student"}!</h1>
        <p className="text-muted-foreground">{t('trackApplications')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalApplications')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} {t('underReview')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('accepted')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              {t('status.ACCEPTED')}!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('myDocuments')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsUploaded}</div>
            <p className="text-xs text-muted-foreground">
              {t('documentsNeeded')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalPaid')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalPaid / 100).toFixed(2)} HTG
            </div>
            <p className="text-xs text-muted-foreground">
              {t('applicationFees')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Applications Tracker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Tracker */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('applicationTracker')}
                  </CardTitle>
                  <CardDescription>{t('trackApplications')}</CardDescription>
                </div>
                <Link href="/apply">
                  <Button size="sm">{t('newApplication')}</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">{t('noApplicationsYet')}</p>
                  <Link href="/apply">
                    <Button>{t('startFirstApplication')}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => {
                    const StatusIcon = getStatusIcon(app.status);
                    const completionPercentage = app.checklist 
                      ? (Object.values(app.checklist).filter(Boolean).length / Object.values(app.checklist).length) * 100
                      : 0;

                    return (
                      <div key={app.id} className={`border rounded-lg p-4 ${getStatusColor(app.status)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusIcon className="h-4 w-4" />
                              <h3 className="font-semibold">{app.programName || "Program"}</h3>
                            </div>
                            <p className="text-sm opacity-90">{app.universityName || "University"}</p>
                          </div>
                          <Badge variant={app.status === "ACCEPTED" ? "default" : "secondary"}>
                            {app.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="opacity-80">{t('applicationProgress')}</span>
                            <span className="font-medium">{Math.round(completionPercentage)}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>

                        {/* Checklist */}
                        {app.checklist && (
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="flex items-center gap-1">
                              {app.checklist.profileComplete ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 opacity-50" />
                              )}
                              <span className="opacity-80">{t('profile')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {app.checklist.documentsUploaded ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 opacity-50" />
                              )}
                              <span className="opacity-80">{t('documents')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {app.checklist.essaysSubmitted ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 opacity-50" />
                              )}
                              <span className="opacity-80">{t('essays')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {app.checklist.paymentReceived ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 opacity-50" />
                              )}
                              <span className="opacity-80">{t('payment')}</span>
                            </div>
                          </div>
                        )}

                        {/* Date and Payment Info */}
                        <div className="flex items-center justify-between text-xs opacity-80">
                          <span>
                            {app.submittedAt && 
                              `${t('submitted')}: ${new Date(app.submittedAt.seconds * 1000 || app.submittedAt).toLocaleDateString()}`
                            }
                          </span>
                          {app.feePaidCents > 0 && (
                            <span className="font-medium">
                              {t('paid')}: {(app.feePaidCents / 100).toFixed(2)} {app.feePaidCurrency || "HTG"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('paymentHistory')}
              </CardTitle>
              <CardDescription>{t('myApplications')}</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter(app => app.feePaidCents > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('noPaymentsRecorded')}
                </p>
              ) : (
                <div className="space-y-3">
                  {applications.filter(app => app.feePaidCents > 0).map((app) => (
                    <div key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{app.programName}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.updatedAt && new Date(app.updatedAt.seconds * 1000 || app.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {(app.feePaidCents / 100).toFixed(2)} {app.feePaidCurrency || "HTG"}
                        </p>
                        <p className="text-xs text-muted-foreground">{t('paid')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('notificationCenter')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pending > 0 && (
                  <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {t('applicationsUnderReview')}
                      </p>
                      <p className="text-xs text-blue-700">
                        {t('applicationsBeingReviewed', { 
                          count: stats.pending,
                          plural: stats.pending > 1 ? 's' : '',
                          verb: stats.pending > 1 ? 'are' : 'is'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {stats.accepted > 0 && (
                  <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {t('congratulations')}
                      </p>
                      <p className="text-xs text-green-700">
                        {t('acceptedToPrograms', { 
                          count: stats.accepted,
                          plural: stats.accepted > 1 ? 's' : ''
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {applications.some(app => !app.checklist?.paymentReceived) && (
                  <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        {t('paymentRequired')}
                      </p>
                      <p className="text-xs text-amber-700">
                        {t('paymentsNeeded')}
                      </p>
                    </div>
                  </div>
                )}

                {stats.totalApplications === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('noNewNotifications')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/apply">
                <Button className="w-full" variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('newApplication')}
                </Button>
              </Link>
              <Link href="/dashboard/documents">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('manageDocuments')}
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button className="w-full" variant="outline">
                  {t('editProfile')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Document Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>{t('requiredDocuments')}</CardTitle>
              <CardDescription>{t('requiredDocumentsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { name: t('birthCertificate'), uploaded: documents.some(d => d.kind === "BIRTH_CERTIFICATE") },
                  { name: t('baccalaureat'), uploaded: documents.some(d => d.kind === "BACCALAUREAT") },
                  { name: t('transcript'), uploaded: documents.some(d => d.kind === "TRANSCRIPT") },
                  { name: t('passportPhoto'), uploaded: documents.some(d => d.kind === "PASSPORT_PHOTO") },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {doc.uploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={doc.uploaded ? "text-green-600" : "text-muted-foreground"}>
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
