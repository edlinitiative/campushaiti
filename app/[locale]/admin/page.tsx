"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <p>Loading dashboard...</p>
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
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800 mb-3">
                You&apos;re viewing demo data. To access the real admin dashboard, please{" "}
                <Link href="/auth/signin" className="underline font-medium">
                  sign in
                </Link>{" "}
                with your admin account.
              </p>
              <div className="text-xs text-amber-700">
                This demo shows you what the platform admin portal looks like with sample data.
              </div>
            </div>
          </div>
        </div>
      )}
      
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

