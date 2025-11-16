import { requireRole } from "@/lib/auth/server-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase/admin";
import { ArrowLeft, TrendingUp, Users, FileText, Building2, Calendar, DollarSign } from "lucide-react";

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
    
    // Calculate acceptance rate
    const accepted = applications.filter((app: any) => app.status === "ACCEPTED").length;
    const total = applications.length;
    const acceptanceRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : "0";

    // Applications by status
    const byStatus = {
      submitted: applications.filter((app: any) => app.status === "SUBMITTED").length,
      underReview: applications.filter((app: any) => app.status === "UNDER_REVIEW").length,
      accepted: applications.filter((app: any) => app.status === "ACCEPTED").length,
      rejected: applications.filter((app: any) => app.status === "REJECTED").length,
      waitlisted: applications.filter((app: any) => app.status === "WAITLISTED").length,
    };

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

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentApplications = applications.filter((app: any) => {
      const created = app.createdAt?.seconds * 1000 || app.createdAt || 0;
      return created > thirtyDaysAgo;
    }).length;

    const recentUsers = usersSnap.docs.filter((doc: any) => {
      const created = doc.data().createdAt?.seconds * 1000 || doc.data().createdAt || 0;
      return created > thirtyDaysAgo;
    }).length;

    return {
      total: {
        universities: universitiesSnap.size,
        programs: programsSnap.size,
        applications: applicationsSnap.size,
        users: usersSnap.size,
      },
      acceptanceRate,
      byStatus,
      topUniversities,
      topPrograms,
      recent: {
        applications: recentApplications,
        users: recentUsers,
      },
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      total: { universities: 0, programs: 0, applications: 0, users: 0 },
      acceptanceRate: "0",
      byStatus: { submitted: 0, underReview: 0, accepted: 0, rejected: 0, waitlisted: 0 },
      topUniversities: [],
      topPrograms: [],
      recent: { applications: 0, users: 0 },
    };
  }
}

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN"]);
  
  const analytics = await getAnalytics();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">Usage statistics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acceptance Rate</CardDescription>
            <CardTitle className="text-3xl text-green-600">{analytics.acceptanceRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {analytics.byStatus.accepted} accepted of {analytics.total.applications} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applications (30d)</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{analytics.recent.applications}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Recent activity</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Users (30d)</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{analytics.recent.users}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total users: {analytics.total.users}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Apps per University</CardDescription>
            <CardTitle className="text-3xl text-indigo-600">
              {analytics.total.universities > 0 
                ? Math.round(analytics.total.applications / analytics.total.universities)
                : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across {analytics.total.universities} universities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Applications by Status</CardTitle>
          </div>
          <CardDescription>Distribution of application statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Accepted</span>
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
                <span className="text-sm font-medium">Under Review</span>
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
                <span className="text-sm font-medium">Submitted (New)</span>
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
                <span className="text-sm font-medium">Waitlisted</span>
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
                <span className="text-sm font-medium">Rejected</span>
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

      {/* Top Universities and Programs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <CardTitle>Top Universities</CardTitle>
            </div>
            <CardDescription>By number of applications received</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topUniversities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topUniversities.map((uni: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{uni.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{uni.count} apps</span>
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
              <CardTitle>Popular Programs</CardTitle>
            </div>
            <CardDescription>Most applied-to programs</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topPrograms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topPrograms.map((prog: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{prog.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{prog.count} apps</span>
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
