"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SchoolApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const mockApplications = [
    {
      id: "1",
      applicantName: "Marie Joseph",
      applicantEmail: "marie.j@email.com",
      program: "Licence en Informatique",
      submittedAt: "2025-11-10",
      status: "SUBMITTED",
    },
    {
      id: "2",
      applicantName: "Jean Baptiste",
      applicantEmail: "jean.b@email.com",
      program: "Licence en Administration",
      submittedAt: "2025-11-09",
      status: "UNDER_REVIEW",
    },
    {
      id: "3",
      applicantName: "Sophie Laurent",
      applicantEmail: "sophie.l@email.com",
      program: "Master en Gestion",
      submittedAt: "2025-11-08",
      status: "ACCEPTED",
    },
  ];

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
          applicantName: app.personalInfo?.fullName || "Unknown",
          applicantEmail: app.personalInfo?.email || "",
          program: app.programName || "Unknown Program",
          submittedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "",
          status: app.status || "SUBMITTED",
        }));
        
        setApplications(transformedApps);
      } else {
        // Fallback to mock data
        setApplications(mockApplications);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
      setApplications(mockApplications);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage and review applications to your programs</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/schools/dashboard">← Back to Dashboard</Link>
        </Button>
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
                      <Button size="sm">
                        Start Review
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
