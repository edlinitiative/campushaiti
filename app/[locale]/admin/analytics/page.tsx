import { requireRole } from "@/lib/auth/server-auth";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign,
  Download,
  Globe,
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

async function getAnalytics() {
  const db = getAdminDb();
  
  try {
    const [
      universitiesSnap,
      programsSnap,
      applicationsSnap,
      usersSnap,
    ] = await Promise.all([
      db.collection("universities").get(),
      db.collection("programs").get(),
      db.collection("applicationItems").get(),
      db.collection("users").get(),
    ]);

    const applications = applicationsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    const users = usersSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    // Time periods
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    // Revenue calculations
    const totalRevenue = applications.reduce((sum: number, app: any) => {
      return sum + (app.feePaidCents || 0);
    }, 0);

    const revenueThisMonth = applications
      .filter((app: any) => {
        const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
        return created > thirtyDaysAgo;
      })
      .reduce((sum: number, app: any) => sum + (app.feePaidCents || 0), 0);

    const revenueLastMonth = applications
      .filter((app: any) => {
        const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
        return created > sixtyDaysAgo && created <= thirtyDaysAgo;
      })
      .reduce((sum: number, app: any) => sum + (app.feePaidCents || 0), 0);

    const revenueGrowth = revenueLastMonth > 0 
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : "0";

    // Application growth
    const appsThisMonth = applications.filter((app: any) => {
      const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
      return created > thirtyDaysAgo;
    }).length;

    const appsLastMonth = applications.filter((app: any) => {
      const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
      return created > sixtyDaysAgo && created <= thirtyDaysAgo;
    }).length;

    const appGrowth = appsLastMonth > 0
      ? (((appsThisMonth - appsLastMonth) / appsLastMonth) * 100).toFixed(1)
      : "0";

    // User growth
    const usersThisMonth = users.filter((user: any) => {
      const created = user.createdAt?.seconds * 1000 || user.createdAt || 0;
      return created > thirtyDaysAgo;
    }).length;

    const usersLastMonth = users.filter((user: any) => {
      const created = user.createdAt?.seconds * 1000 || user.createdAt || 0;
      return created > sixtyDaysAgo && created <= thirtyDaysAgo;
    }).length;

    const userGrowth = usersLastMonth > 0
      ? (((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
      : "0";

    // Acceptance metrics
    const accepted = applications.filter((app: any) => app.status === "ACCEPTED").length;
    const acceptanceRate = applications.length > 0 ? ((accepted / applications.length) * 100).toFixed(1) : "0";

    // Applications by status
    const byStatus = {
      submitted: applications.filter((app: any) => app.status === "SUBMITTED").length,
      underReview: applications.filter((app: any) => app.status === "UNDER_REVIEW").length,
      accepted: applications.filter((app: any) => app.status === "ACCEPTED").length,
      rejected: applications.filter((app: any) => app.status === "REJECTED").length,
      waitlisted: applications.filter((app: any) => app.status === "WAITLISTED").length,
    };

    // Geographic distribution (by city from applications)
    const cityCounts: any = {};
    applications.forEach((app: any) => {
      const city = app.applicantCity || app.city || "Unknown";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    
    const topCities = Object.entries(cityCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top universities by applications
    const universityCounts: any = {};
    applications.forEach((app: any) => {
      const uniName = app.universityName || "Unknown";
      universityCounts[uniName] = (universityCounts[uniName] || 0) + 1;
    });
    
    const topUniversities = Object.entries(universityCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top programs
    const programCounts: any = {};
    applications.forEach((app: any) => {
      const progName = app.programName || "Unknown";
      programCounts[progName] = (programCounts[progName] || 0) + 1;
    });
    
    const topPrograms = Object.entries(programCounts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // User engagement metrics
    const activeUsers = users.filter((user: any) => {
      const lastActive = user.lastActiveAt?.seconds * 1000 || user.updatedAt?.seconds * 1000 || 0;
      return lastActive > sevenDaysAgo;
    }).length;

    const usersByRole = {
      applicants: users.filter((u: any) => u.role === "APPLICANT" || !u.role).length,
      schoolAdmins: users.filter((u: any) => u.role === "SCHOOL_ADMIN").length,
      admins: users.filter((u: any) => u.role === "ADMIN").length,
    };

    // Application processing time (average days from submission to decision)
    const decidedApps = applications.filter((app: any) => 
      ["ACCEPTED", "REJECTED"].includes(app.status) && app.submittedAt && app.updatedAt
    );

    const avgProcessingTime = decidedApps.length > 0
      ? decidedApps.reduce((sum: number, app: any) => {
          const submitted = app.submittedAt?.seconds * 1000 || 0;
          const updated = app.updatedAt?.seconds * 1000 || 0;
          const days = (updated - submitted) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / decidedApps.length
      : 0;

    // Recent activity
    const recentActivity = {
      last24h: {
        applications: applications.filter((app: any) => {
          const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
          return created > oneDayAgo;
        }).length,
        users: users.filter((user: any) => {
          const created = user.createdAt?.seconds * 1000 || user.createdAt || 0;
          return created > oneDayAgo;
        }).length,
      },
      last7d: {
        applications: applications.filter((app: any) => {
          const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
          return created > sevenDaysAgo;
        }).length,
        users: users.filter((user: any) => {
          const created = user.createdAt?.seconds * 1000 || user.createdAt || 0;
          return created > sevenDaysAgo;
        }).length,
      },
      last30d: {
        applications: appsThisMonth,
        users: usersThisMonth,
      },
    };

    return {
      total: {
        universities: universitiesSnap.size,
        programs: programsSnap.size,
        applications: applicationsSnap.size,
        users: usersSnap.size,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        growth: parseFloat(revenueGrowth),
      },
      growth: {
        applications: parseFloat(appGrowth),
        users: parseFloat(userGrowth),
      },
      acceptanceRate,
      byStatus,
      topUniversities,
      topPrograms,
      topCities,
      usersByRole,
      activeUsers,
      avgProcessingTime: avgProcessingTime.toFixed(1),
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      total: { universities: 0, programs: 0, applications: 0, users: 0 },
      revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
      growth: { applications: 0, users: 0 },
      acceptanceRate: "0",
      byStatus: { submitted: 0, underReview: 0, accepted: 0, rejected: 0, waitlisted: 0 },
      topUniversities: [],
      topPrograms: [],
      topCities: [],
      usersByRole: { applicants: 0, schoolAdmins: 0, admins: 0 },
      activeUsers: 0,
      avgProcessingTime: "0",
      recentActivity: {
        last24h: { applications: 0, users: 0 },
        last7d: { applications: 0, users: 0 },
        last30d: { applications: 0, users: 0 },
      },
    };
  }
}

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN"]);
  
  const t = await getTranslations("admin.analytics");
  const analytics = await getAnalytics();

  const exportData = () => {
    // This would be handled client-side
    return;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToDashboard")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t("exportReport")}
        </Button>
      </div>

      {/* Revenue & Growth Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {t("totalRevenue")}
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {(analytics.revenue.total / 100).toLocaleString()} HTG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {analytics.revenue.growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {t("fromLastMonth", { rate: Math.abs(analytics.revenue.growth) })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("monthlyRevenue")}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {(analytics.revenue.thisMonth / 100).toLocaleString()} HTG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("lastMonth")}: {(analytics.revenue.lastMonth / 100).toLocaleString()} HTG
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("applicationGrowth")}</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {analytics.growth.applications >= 0 ? '+' : ''}{analytics.growth.applications}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("newApplicationsThisMonth", { count: analytics.recentActivity.last30d.applications })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("userGrowth")}</CardDescription>
            <CardTitle className="text-3xl text-indigo-600">
              {analytics.growth.users >= 0 ? '+' : ''}{analytics.growth.users}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("newUsersThisMonth", { count: analytics.recentActivity.last30d.users })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {t("universities")}
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.total.universities}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("activeInstitutions")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {t("programs")}
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.total.programs}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("availablePrograms")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {t("applications")}
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.total.applications}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("totalSubmissions")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {t("totalUsers")}
            </CardDescription>
            <CardTitle className="text-3xl">{analytics.total.users}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsers} {t("active7d")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement & Processing Time */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <CardTitle>{t("userEngagement")}</CardTitle>
            </div>
            <CardDescription>{t("userEngagementDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t("activeUsers")}</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.activeUsers} / {analytics.total.users} ({analytics.total.users > 0 ? ((analytics.activeUsers / analytics.total.users) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analytics.total.users > 0 ? (analytics.activeUsers / analytics.total.users) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t("applicants")}</p>
                  <p className="text-2xl font-bold">{analytics.usersByRole.applicants}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("schoolAdmins")}</p>
                  <p className="text-2xl font-bold">{analytics.usersByRole.schoolAdmins}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("admins")}</p>
                  <p className="text-2xl font-bold">{analytics.usersByRole.admins}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <CardTitle>{t("processingMetrics")}</CardTitle>
            </div>
            <CardDescription>{t("processingMetricsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("avgProcessingTime")}</p>
                <p className="text-4xl font-bold text-amber-600">{analytics.avgProcessingTime} {t("days")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("acceptanceRate")}</p>
                    <p className="text-xl font-bold text-green-600">{analytics.acceptanceRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("rejectionRate")}</p>
                    <p className="text-xl font-bold text-red-600">
                      {analytics.total.applications > 0 ? ((analytics.byStatus.rejected / analytics.total.applications) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <CardTitle>{t("recentActivity")}</CardTitle>
          </div>
          <CardDescription>{t("recentActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("last24Hours")}</span>
                <Badge variant="secondary">{t("recent")}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("applications")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last24h.applications}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("newUsers")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last24h.users}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("last7Days")}</span>
                <Badge variant="secondary">{t("week")}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("applications")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last7d.applications}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("newUsers")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last7d.users}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("last30Days")}</span>
                <Badge variant="secondary">{t("month")}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("applications")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last30d.applications}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("newUsers")}: <span className="font-semibold text-foreground">{analytics.recentActivity.last30d.users}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Status Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>{t("applicationsByStatus")}</CardTitle>
          </div>
          <CardDescription>{t("applicationsByStatusDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("accepted")}</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.byStatus.accepted} ({analytics.total.applications > 0 ? ((analytics.byStatus.accepted / analytics.total.applications) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${analytics.total.applications > 0 ? (analytics.byStatus.accepted / analytics.total.applications) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("underReview")}</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.byStatus.underReview} ({analytics.total.applications > 0 ? ((analytics.byStatus.underReview / analytics.total.applications) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
                  style={{ width: `${analytics.total.applications > 0 ? (analytics.byStatus.underReview / analytics.total.applications) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("submitted")}</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.byStatus.submitted} ({analytics.total.applications > 0 ? ((analytics.byStatus.submitted / analytics.total.applications) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analytics.total.applications > 0 ? (analytics.byStatus.submitted / analytics.total.applications) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("waitlisted")}</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.byStatus.waitlisted} ({analytics.total.applications > 0 ? ((analytics.byStatus.waitlisted / analytics.total.applications) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${analytics.total.applications > 0 ? (analytics.byStatus.waitlisted / analytics.total.applications) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("rejected")}</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.byStatus.rejected} ({analytics.total.applications > 0 ? ((analytics.byStatus.rejected / analytics.total.applications) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${analytics.total.applications > 0 ? (analytics.byStatus.rejected / analytics.total.applications) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution & Top Performers */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              <CardTitle>{t("geographicDistribution")}</CardTitle>
            </div>
            <CardDescription>{t("topCitiesByApplicants")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topCities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {analytics.topCities.map((city: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-medium text-teal-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{city.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{city.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle>{t("topUniversities")}</CardTitle>
            </div>
            <CardDescription>{t("byNumberOfApplications")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topUniversities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {analytics.topUniversities.map((uni: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{uni.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{uni.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <CardTitle>{t("popularPrograms")}</CardTitle>
            </div>
            <CardDescription>{t("mostAppliedToPrograms")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPrograms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {analytics.topPrograms.map((prog: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{prog.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{prog.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
