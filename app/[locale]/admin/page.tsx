import { requireRole } from "@/lib/auth/server-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase/admin";
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

async function getAdminStats() {
  const db = getAdminDb();
  
  try {
    // Get counts from Firestore
    const [universitiesSnap, programsSnap, applicationsSnap, usersSnap] = await Promise.all([
      db.collection("universities").get(),
      db.collection("programs").get(),
      db.collection("applicationItems").get(),
      db.collection("users").get(),
    ]);

    // Get pending universities
    const pendingUniversities = universitiesSnap.docs.filter(
      doc => doc.data().status === "PENDING"
    ).length;

    // Get application stats
    const applications = applicationsSnap.docs.map(doc => doc.data());
    const pendingApps = applications.filter(app => app.status === "SUBMITTED").length;
    const underReviewApps = applications.filter(app => app.status === "UNDER_REVIEW").length;
    const acceptedApps = applications.filter(app => app.status === "ACCEPTED").length;

    return {
      totalUniversities: universitiesSnap.size,
      pendingUniversities,
      approvedUniversities: universitiesSnap.docs.filter(
        doc => doc.data().status === "APPROVED"
      ).length,
      totalPrograms: programsSnap.size,
      totalApplications: applicationsSnap.size,
      pendingApplications: pendingApps,
      underReviewApplications: underReviewApps,
      acceptedApplications: acceptedApps,
      totalUsers: usersSnap.size,
      applicants: usersSnap.docs.filter(doc => doc.data().role === "APPLICANT").length,
      schoolAdmins: usersSnap.docs.filter(doc => doc.data().role === "SCHOOL_ADMIN").length,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
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
    };
  }
}

export default async function AdminPage() {
  // Require admin role
  await requireRole(["ADMIN"]);

  const stats = await getAdminStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage universities, programs, and monitor platform activity</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Universities</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUniversities}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">{stats.approvedUniversities} approved</span>
            </div>
            {stats.pendingUniversities > 0 && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-amber-600 font-medium">{stats.pendingUniversities} pending</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Programs</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.totalPrograms}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across {stats.approvedUniversities} universities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.totalApplications}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accepted:</span>
                <span className="text-green-600 font-medium">{stats.acceptedApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Review:</span>
                <span className="text-amber-600">{stats.underReviewApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New:</span>
                <span>{stats.pendingApplications}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicants:</span>
                <span>{stats.applicants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">School Admins:</span>
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
              <CardTitle>Action Required</CardTitle>
            </div>
            <CardDescription>Pending university registrations need review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>{stats.pendingUniversities}</strong> {stats.pendingUniversities === 1 ? 'university is' : 'universities are'} waiting for approval
              </p>
              <Button asChild>
                <Link href="/admin/universities">Review Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Sections */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">University Management</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <CardTitle>Universities</CardTitle>
              </div>
              <CardDescription>Approve and manage university registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved:</span>
                  <Badge variant="outline">{stats.approvedUniversities}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending:</span>
                  <Badge variant="outline" className="bg-amber-100">{stats.pendingUniversities}</Badge>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/admin/universities">Manage Universities</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <CardTitle>Programs</CardTitle>
              </div>
              <CardDescription>View and configure university programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stats.totalPrograms} programs across {stats.approvedUniversities} universities
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/programs">View All Programs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Application Management</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <CardTitle>All Applications</CardTitle>
              </div>
              <CardDescription>Monitor and review all student applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <Badge>{stats.totalApplications}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Review:</span>
                  <Badge variant="outline">{stats.pendingApplications}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Accepted:</span>
                  <Badge variant="outline" className="bg-green-100">{stats.acceptedApplications}</Badge>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/applications">View Applications</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Users:</span>
                  <Badge>{stats.totalUsers}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applicants:</span>
                  <Badge variant="outline">{stats.applicants}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">School Admins:</span>
                  <Badge variant="outline">{stats.schoolAdmins}</Badge>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Platform Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <CardTitle>Analytics</CardTitle>
              </div>
              <CardDescription>Platform usage and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <CardTitle>Payments</CardTitle>
              </div>
              <CardDescription>Payment tracking and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/payments">View Payments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                <CardTitle>Settings</CardTitle>
              </div>
              <CardDescription>Platform configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/settings">Configure</Link>
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
            <CardTitle>System Status</CardTitle>
          </div>
          <CardDescription>Platform health and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Authentication</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Storage</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

