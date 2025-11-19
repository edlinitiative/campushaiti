"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart3, Download, Mail, CheckSquare, XSquare } from "lucide-react";
import { getDemoApplications } from "@/lib/demo-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SchoolApplicationsPage() {
  const t = useTranslations("schools.applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<'status' | 'email' | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>("UNDER_REVIEW");
  const [bulkEmailSubject, setBulkEmailSubject] = useState("");
  const [bulkEmailMessage, setBulkEmailMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Advanced filters
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

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
    // Status filter
    if (filter !== "all" && app.status !== filter) return false;
    
    // Search filter
    if (search && !app.applicantName.toLowerCase().includes(search.toLowerCase()) &&
        !app.applicantEmail.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Program filter
    if (programFilter !== "all" && app.program !== programFilter) return false;
    
    // Date filter
    if (dateFilter !== "all") {
      const appDate = new Date(app.submittedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today" && daysDiff > 0) return false;
      if (dateFilter === "week" && daysDiff > 7) return false;
      if (dateFilter === "month" && daysDiff > 30) return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case "date-asc":
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      case "name-asc":
        return a.applicantName.localeCompare(b.applicantName);
      case "name-desc":
        return b.applicantName.localeCompare(a.applicantName);
      default:
        return 0;
    }
  });

  // Get unique programs for filter
  const uniquePrograms = Array.from(new Set(applications.map(app => app.program)));

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setProgramFilter("all");
    setDateFilter("all");
    setSortBy("date-desc");
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map(app => app.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkStatusUpdate = async () => {
    if (demoMode) {
      alert("Demo Mode: Bulk actions are not available. Please sign in to use this feature.");
      setBulkActionDialog(null);
      return;
    }

    setProcessing(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/schools/applications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkStatus })
          })
        )
      );
      
      alert(`Successfully updated ${selectedIds.length} applications to ${bulkStatus.replace('_', ' ')}`);
      setSelectedIds([]);
      setBulkActionDialog(null);
      loadApplications();
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Failed to update some applications. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkEmail = async () => {
    if (demoMode) {
      alert("Demo Mode: Bulk email is not available. Please sign in to use this feature.");
      setBulkActionDialog(null);
      return;
    }

    if (!bulkEmailSubject.trim() || !bulkEmailMessage.trim()) {
      alert('Please provide both subject and message');
      return;
    }

    setProcessing(true);
    try {
      const selectedApps = applications.filter(app => selectedIds.includes(app.id));
      
      await Promise.all(
        selectedApps.map(app =>
          fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: app.applicantEmail,
              template: 'customMessage',
              data: {
                studentName: app.applicantName,
                subject: bulkEmailSubject,
                message: bulkEmailMessage
              }
            })
          })
        )
      );
      
      alert(`Successfully sent email to ${selectedIds.length} applicants`);
      setSelectedIds([]);
      setBulkActionDialog(null);
      setBulkEmailSubject('');
      setBulkEmailMessage('');
    } catch (error) {
      console.error('Bulk email error:', error);
      alert('Failed to send some emails. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const selectedApps = selectedIds.length > 0 
      ? applications.filter(app => selectedIds.includes(app.id))
      : filteredApplications;

    const headers = ['Name', 'Email', 'Program', 'Status', 'Submitted Date'];
    const rows = selectedApps.map(app => [
      app.applicantName,
      app.applicantEmail,
      app.program,
      app.status,
      app.submittedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <h3 className="font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800 mb-2">
                {t("demoModeMessage")}{' '}
                <Link href="/auth/signin" className="underline font-medium">{t("signIn")}</Link>
                {' '}{t("or")}{' '}
                <Link href="/schools/register" className="underline font-medium">{t("registerInstitution")}</Link>.
              </p>
              <p className="text-xs text-amber-700">
                {t("demoDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("viewAnalytics")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard">← {t("backToDashboard")}</Link>
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Card className="mb-6 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {selectedIds.length} {selectedIds.length > 1 ? t("applicationPlural") : t("application")} {t("selected")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionDialog('status')}
                  disabled={processing}
                >
                  {t("updateStatus")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkActionDialog('email')}
                  disabled={processing}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t("sendEmail")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("exportCSV")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  <XSquare className="h-4 w-4 mr-2" />
                  {t("clear")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Primary Filters */}
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">{t("all")}</TabsTrigger>
                  <TabsTrigger value="SUBMITTED">{t("new")}</TabsTrigger>
                  <TabsTrigger value="UNDER_REVIEW">{t("inReview")}</TabsTrigger>
                  <TabsTrigger value="ACCEPTED">{t("accepted")}</TabsTrigger>
                  <TabsTrigger value="REJECTED">{t("rejected")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Advanced Filters */}
            <div className="flex gap-4 flex-wrap items-center border-t pt-4">
              <div className="w-[200px]">
                <Label className="text-xs text-muted-foreground mb-1">{t("program")}</Label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("allPrograms")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allPrograms")}</SelectItem>
                    {uniquePrograms.map(program => (
                      <SelectItem key={program} value={program}>{program}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[200px]">
                <Label className="text-xs text-muted-foreground mb-1">{t("submitted")}</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("allTime")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allTime")}</SelectItem>
                    <SelectItem value="today">{t("today")}</SelectItem>
                    <SelectItem value="week">{t("thisWeek")}</SelectItem>
                    <SelectItem value="month">{t("thisMonth")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[200px]">
                <Label className="text-xs text-muted-foreground mb-1">{t("sortBy")}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">{t("newestFirst")}</SelectItem>
                    <SelectItem value="date-asc">{t("oldestFirst")}</SelectItem>
                    <SelectItem value="name-asc">{t("nameAZ")}</SelectItem>
                    <SelectItem value="name-desc">{t("nameZA")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 ml-auto">
                {(search || filter !== "all" || programFilter !== "all" || dateFilter !== "all" || sortBy !== "date-desc") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    {t("clearFilters")}
                  </Button>
                )}
                {filteredApplications.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("export")}
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Summary */}
            {filteredApplications.length !== applications.length && (
              <div className="text-sm text-muted-foreground">
                {t("showing")} {filteredApplications.length} {t("of")} {applications.length} {t("applicationPlural")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">{t("noApplicationsFound")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Header */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                    onCheckedChange={toggleSelectAll}
                    id="select-all"
                  />
                  <Label htmlFor="select-all" className="cursor-pointer font-medium">
                    {t("selectAll")} ({filteredApplications.length})
                  </Label>
                </div>
              </CardContent>
            </Card>

            {filteredApplications.map((app) => (
              <Card key={app.id} className={`hover:shadow-md transition-shadow ${selectedIds.includes(app.id) ? 'border-primary' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-start">
                    <Checkbox
                      checked={selectedIds.includes(app.id)}
                      onCheckedChange={() => toggleSelect(app.id)}
                      id={`select-${app.id}`}
                    />
                    <div className="flex justify-between items-start flex-1">
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
                            {t("viewDetails")}
                          </Link>
                        </Button>
                        {app.status === "SUBMITTED" && (
                          <Button size="sm" asChild>
                            <Link href={`/schools/dashboard/applications/${app.id}`}>
                              {t("startReview")}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {filteredApplications.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              {t("previous")}
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Status Update Dialog */}
      <Dialog open={bulkActionDialog === 'status'} onOpenChange={(open) => !open && setBulkActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("updateStatusFor")} {selectedIds.length} {t("applicationPlural")}</DialogTitle>
            <DialogDescription>
              {t("chooseNewStatus")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="bulk-status">{t("newStatus")}</Label>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger id="bulk-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNDER_REVIEW">{t("underReview")}</SelectItem>
                  <SelectItem value="ACCEPTED">{t("accepted")}</SelectItem>
                  <SelectItem value="REJECTED">{t("rejected")}</SelectItem>
                  <SelectItem value="WAITLISTED">{t("waitlisted")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={processing}>
              {processing ? t("updating") : `${t("updateApplications")}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkActionDialog === 'email'} onOpenChange={(open) => !open && setBulkActionDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("sendEmailTo")} {selectedIds.length} {t("applicants")}</DialogTitle>
            <DialogDescription>
              {t("composeMessage")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-subject">{t("subject")}</Label>
              <Input
                id="email-subject"
                value={bulkEmailSubject}
                onChange={(e) => setBulkEmailSubject(e.target.value)}
                placeholder={t("emailSubjectPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="email-message">{t("message")}</Label>
              <Textarea
                id="email-message"
                value={bulkEmailMessage}
                onChange={(e) => setBulkEmailMessage(e.target.value)}
                placeholder={t("emailMessagePlaceholder")}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleBulkEmail} disabled={processing || !bulkEmailSubject || !bulkEmailMessage}>
              {processing ? t("sending") : `${t("sendTo")} ${selectedIds.length} ${t("applicants")}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
