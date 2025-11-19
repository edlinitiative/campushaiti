"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, FileText, User } from "lucide-react";

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  programName: string;
  universityName: string;
  status: string;
  submittedAt: any;
}

export default function AdminApplicationsPage() {
  const t = useTranslations("admin.applications");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setDemoMode(false);
      } else {
        // Demo mode
        setDemoMode(true);
        setApplications([
          {
            id: "1",
            applicantName: "Jean Baptiste",
            applicantEmail: "jean@example.com",
            programName: "Bachelor of Computer Science",
            universityName: "Université d'État d'Haïti",
            status: "SUBMITTED",
            submittedAt: new Date("2025-11-10"),
          },
          {
            id: "2",
            applicantName: "Marie Claire",
            applicantEmail: "marie@example.com",
            programName: "Master of Business Administration",
            universityName: "Université Quisqueya",
            status: "UNDER_REVIEW",
            submittedAt: new Date("2025-11-12"),
          },
          {
            id: "3",
            applicantName: "Pierre Joseph",
            applicantEmail: "pierre@example.com",
            programName: "Bachelor of Engineering",
            universityName: "Université d'État d'Haïti",
            status: "ACCEPTED",
            submittedAt: new Date("2025-11-08"),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
      setDemoMode(true);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      SUBMITTED: { label: t("submitted"), className: "bg-blue-100 text-blue-800" },
      UNDER_REVIEW: { label: t("underReview"), className: "bg-amber-100 text-amber-800" },
      ACCEPTED: { label: t("accepted"), className: "bg-green-100 text-green-800" },
      REJECTED: { label: t("rejected"), className: "bg-red-100 text-red-800" },
      WAITLISTED: { label: t("waitlisted"), className: "bg-purple-100 text-purple-800" },
    };
    return variants[status] || { label: status, className: "" };
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.universityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && app.status === activeTab;
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.status === "SUBMITTED").length,
    underReview: applications.filter(a => a.status === "UNDER_REVIEW").length,
    accepted: applications.filter(a => a.status === "ACCEPTED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
    waitlisted: applications.filter(a => a.status === "WAITLISTED").length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t("loading")}</p>
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
              <p className="text-sm text-amber-800">
                {t("demoModeMessage")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToDashboard")}
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("total")}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("submitted")}</p>
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("reviewing")}</p>
            <p className="text-2xl font-bold text-amber-600">{stats.underReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("accepted")}</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("waitlisted")}</p>
            <p className="text-2xl font-bold text-purple-600">{stats.waitlisted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("rejected")}</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("all")} ({stats.total})</TabsTrigger>
          <TabsTrigger value="SUBMITTED">{t("submitted")} ({stats.submitted})</TabsTrigger>
          <TabsTrigger value="UNDER_REVIEW">{t("underReview")} ({stats.underReview})</TabsTrigger>
          <TabsTrigger value="ACCEPTED">{t("accepted")} ({stats.accepted})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const statusInfo = getStatusBadge(app.status);
              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {app.applicantName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {app.applicantEmail}
                        </CardDescription>
                      </div>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("program")}</p>
                        <p className="font-medium">{app.programName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("university")}</p>
                        <p className="font-medium">{app.universityName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("submittedDate")}</p>
                        <p className="font-medium">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("noApplications")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
