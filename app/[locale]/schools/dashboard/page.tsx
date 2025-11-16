"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getServerUser } from "@/lib/auth/server-auth";

export default function SchoolDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [stats, setStats] = useState({
    applications: 0,
    newApplications: 0,
    accepted: 0,
    pending: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Fetch statistics from API
      const response = await fetch('/api/schools/stats');
      
      if (response.ok) {
        const stats = await response.json();
        setStats({
          applications: stats.applications || 0,
          newApplications: stats.newApplications || 0,
          accepted: stats.accepted || 0,
          pending: stats.pending || 0,
        });
        setDemoMode(false);
      } else {
        // Enable demo mode if not authenticated
        setDemoMode(true);
        setStats({
          applications: 45,
          newApplications: 12,
          accepted: 28,
          pending: 17,
        });
      }
      
      setUniversity({
        name: demoMode ? "Demo University" : "Your University",
        status: "APPROVED",
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      // Enable demo mode on error
      setDemoMode(true);
      setStats({
        applications: 45,
        newApplications: 12,
        accepted: 28,
        pending: 17,
      });
      setUniversity({
        name: "Demo University",
        status: "APPROVED",
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
                You&apos;re viewing demo data. To access your real school dashboard, please{" "}
                <Link href="/auth/signin" className="underline font-medium">
                  sign in
                </Link>{" "}
                with your school admin account or{" "}
                <Link href="/schools/register" className="underline font-medium">
                  register your university
                </Link>.
              </p>
              <div className="text-xs text-amber-700">
                This demo shows you what the school portal looks like with sample data.
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">School Dashboard</h1>
          <p className="text-muted-foreground">
            {university?.name || "Manage your applications and programs"}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard/programs">Manage Programs</Link>
          </Button>
          <Button asChild>
            <Link href="/schools/dashboard/settings">Settings</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{stats.applications}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New This Week</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.newApplications}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +{Math.round((stats.newApplications / stats.applications) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.accepted}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.accepted / stats.applications) * 100)}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Requires action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Applications submitted in the last 7 days</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/schools/dashboard/applications">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent applications</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/schools/dashboard/applications">View all applications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Programs</CardTitle>
                  <CardDescription>Degree programs offered by your university</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/schools/dashboard/programs/new">Add Program</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No programs yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/schools/dashboard/programs/new">Create your first program</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
              <CardDescription>Insights into your application process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Acceptance Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((stats.accepted / stats.applications) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(stats.accepted / stats.applications) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pending Review</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((stats.pending / stats.applications) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${(stats.pending / stats.applications) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/schools/dashboard/applications?status=pending">
                <div className="text-left w-full">
                  <div className="font-semibold">Review Applications</div>
                  <div className="text-sm text-muted-foreground">{stats.pending} pending</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/schools/dashboard/programs">
                <div className="text-left w-full">
                  <div className="font-semibold">Manage Programs</div>
                  <div className="text-sm text-muted-foreground">Add or edit programs</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto py-4">
              <Link href="/schools/dashboard/questions">
                <div className="text-left w-full">
                  <div className="font-semibold">Custom Questions</div>
                  <div className="text-sm text-muted-foreground">Customize application</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
