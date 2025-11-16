"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import { getDemoApplications } from "@/lib/demo-data";

export default function SchoolApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const mockApplications = getDemoApplications().map(app => ({
    id: app.id,
    applicantName: app.applicantName,
    applicantEmail: app.applicantEmail,
    program: app.program,
    submittedAt: new Date(app.submittedAt).toLocaleDateString(),
    status: app.status,
  }));

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      const url = filter === "all" 
        ? '/api/schools/applications'
        : `/api/schools/applications?status=${filter.toUpperCase()}`;
        
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const apps = data.applications || [];
        
        // Transform to match expected format
        const transformedApps = apps.map((app: any) => ({
          id: app.id,
          applicantName: app.personalInfo?.fullName || app.applicantName || "Unknown",
          applicantEmail: app.personalInfo?.email || app.applicantEmail || "",
          program: app.programName || "Unknown Program",
          submittedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "",
          status: app.status || "SUBMITTED",
        }));
        
        setApplications(transformedApps);
        setDemoMode(false);
      } else {
        // Fallback to mock data
        setApplications(mockApplications);
        setDemoMode(true);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
      setApplications(mockApplications);
      setDemoMode(true);
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
      case "WAITLISTED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter !== "all" && app.status !== filter) return false;
    if (search && !app.applicantName.toLowerCase().includes(search.toLowerCase()) &&
        !app.applicantEmail.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

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
                You&apos;re viewing sample application data. To manage real applications, please{' '}
                <Link href="/auth/signin" className="underline font-medium">sign in</Link>
                {' '}or{' '}
                <Link href="/schools/register" className="underline font-medium">register your institution</Link>.
              </p>
              <p className="text-xs text-amber-700">
                This demo includes sample applications to demonstrate the application management interface.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage and review applications to your programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="SUBMITTED">New</TabsTrigger>
                <TabsTrigger value="UNDER_REVIEW">In Review</TabsTrigger>
                <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{app.applicantName}</h3>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                    <p className="text-sm">
                      <span className="font-medium">Program:</span> {app.program}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/schools/dashboard/applications/${app.id}`}>
                        View Details
                      </Link>
                    </Button>
                    {app.status === "SUBMITTED" && (
                      <Button size="sm" asChild>
                        <Link href={`/schools/dashboard/applications/${app.id}`}>
                          Start Review
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredApplications.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
