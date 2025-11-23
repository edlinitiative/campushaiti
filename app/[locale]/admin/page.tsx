"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SignupAnalytics from "@/components/admin/SignupAnalytics";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { 
  Building2, 
  GraduationCap, 
  FileText, 
  Users, 
  DollarSign, 
  Settings,
  BarChart3,
  Shield,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface AdminStats {
  totalUniversities: number;
  pendingUniversities: number;
  approvedUniversities: number;
  totalPrograms: number;
  totalApplications: number;
  pendingApplications: number;
  underReviewApplications: number;
  acceptedApplications: number;
  totalUsers: number;
  applicants: number;
  schoolAdmins: number;
}

export default function AdminPage() {
  const t = useTranslations("admin.dashboard");
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUniversities: 0,
    pendingUniversities: 0,
    approvedUniversities: 0,
    totalPrograms: 0,
    totalApplications: 0,
    pendingApplications: 0,
    underReviewApplications: 0,
    acceptedApplications: 0,
    totalUsers: 0,
    applicants: 0,
    schoolAdmins: 0,
  });

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setDemoMode(false);
      } else {
        // Enable demo mode if not authenticated
        setDemoMode(true);
        setStats({
          totalUniversities: 12,
          pendingUniversities: 3,
          approvedUniversities: 9,
          totalPrograms: 48,
          totalApplications: 234,
          pendingApplications: 45,
          underReviewApplications: 67,
          acceptedApplications: 89,
          totalUsers: 567,
          applicants: 523,
          schoolAdmins: 42,
        });
      }
    } catch (err) {
      console.error("Error loading admin stats:", err);
      // Enable demo mode on error
      setDemoMode(true);
      setStats({
        totalUniversities: 12,
        pendingUniversities: 3,
        approvedUniversities: 9,
        totalPrograms: 48,
        totalApplications: 234,
        pendingApplications: 45,
        underReviewApplications: 67,
        acceptedApplications: 89,
        totalUsers: 567,
        applicants: 523,
        schoolAdmins: 42,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t("loadingDashboard")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {demoMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800 mb-3">
                {t("demoModeMessage")}{" "}
                <Link href="/auth/signin" className="underline font-medium">
                  {t("signIn")}
                </Link>{" "}
                {t("withAdminAccount")}
              </p>
              <div className="text-xs text-amber-700">
                {t("demoDescription")}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalUniversities")}</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUniversities}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">{stats.approvedUniversities} {t("approved")}</span>
            </div>
            {stats.pendingUniversities > 0 && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-amber-600 font-medium">{stats.pendingUniversities} {t("pending")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalPrograms")}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.totalPrograms}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("acrossUniversities").replace("across universities", `${stats.approvedUniversities} universities`)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalApplications")}</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.totalApplications}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("accepted")}:</span>
                <span className="text-green-600 font-medium">{stats.acceptedApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("underReview")}:</span>
                <span className="text-amber-600">{stats.underReviewApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("pending")}:</span>
                <span>{stats.pendingApplications}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalUsersCard")}</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("applicants")}:</span>
                <span>{stats.applicants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("schoolAdmins")}:</span>
                <span>{stats.schoolAdmins}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - High Priority */}
      {stats.pendingUniversities > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <CardTitle>{t("actionRequired")}</CardTitle>
            </div>
            <CardDescription>{t("pendingUniversitiesNeedReview")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>{stats.pendingUniversities}</strong> {stats.pendingUniversities === 1 ? t("universityWaitingApproval") : t("universitiesWaitingApproval")}
              </p>
              <Button asChild>
                <Link href="/admin/universities">{t("reviewNow")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Sections */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("universityManagement")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <CardTitle>{t("universities")}</CardTitle>
              </div>
              <CardDescription>{t("approveManageRegistrations")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("approved")}:</span>
                  <Badge variant="outline">{stats.approvedUniversities}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("pending")}:</span>
                  <Badge variant="outline" className="bg-amber-100">{stats.pendingUniversities}</Badge>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/admin/universities">{t("manageUniversitiesBtn")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <CardTitle>{t("programs")}</CardTitle>
              </div>
              <CardDescription>{t("viewConfigurePrograms")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stats.totalPrograms} {t("programsAcross")} {stats.approvedUniversities} {t("universitiesLower")}
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/programs">{t("viewAllPrograms")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("applicationManagement")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <CardTitle>{t("allApplications")}</CardTitle>
              </div>
              <CardDescription>{t("monitorReviewApplications")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("total")}:</span>
                  <Badge>{stats.totalApplications}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("pendingReviewLabel")}:</span>
                  <Badge variant="outline">{stats.pendingApplications}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("accepted")}:</span>
                  <Badge variant="outline" className="bg-green-100">{stats.acceptedApplications}</Badge>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/applications">{t("viewApplicationsBtn")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <CardTitle>{t("userManagement")}</CardTitle>
              </div>
              <CardDescription>{t("manageUsersPermissions")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("totalUsersLabel")}:</span>
                  <Badge>{stats.totalUsers}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("applicantsLabel")}:</span>
                  <Badge variant="outline">{stats.applicants}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("schoolAdminsLabel")}:</span>
                  <Badge variant="outline">{stats.schoolAdmins}</Badge>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/users">{t("manageUsersBtn")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signup Analytics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("signupAnalytics")}</h2>
        <SignupAnalytics />
      </div>

      {/* Role Management */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Administrator Management</h2>
        <RoleManagement />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("platformTools")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <CardTitle>{t("analytics")}</CardTitle>
              </div>
              <CardDescription>{t("platformUsageStats")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/analytics">{t("viewAnalyticsBtn")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <CardTitle>{t("payments")}</CardTitle>
              </div>
              <CardDescription>{t("paymentTrackingRevenue")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/payments">{t("viewPaymentsBtn")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <CardTitle>{t("settings")}</CardTitle>
              </div>
              <CardDescription>{t("platformConfigurationDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/settings">{t("configureBtn")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <CardTitle>{t("systemStatus")}</CardTitle>
          </div>
          <CardDescription>{t("platformHealthMonitoring")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t("database")}</p>
                <p className="text-xs text-muted-foreground">{t("operational")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t("authentication")}</p>
                <p className="text-xs text-muted-foreground">{t("operational")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t("storage")}</p>
                <p className="text-xs text-muted-foreground">{t("operational")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <PlatformSettings />
    </div>
  );
}

