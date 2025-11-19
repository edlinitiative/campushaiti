"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText, CheckCircle, Users, Clock, XCircle, AlertCircle, Download, Calendar, BarChart } from "lucide-react";

export default function SchoolAnalyticsPage() {
  const t = useTranslations("schools.analytics");
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    financial: {
      totalRevenue: 0,
      totalApplications: 0,
      paidApplications: 0,
      averageFee: 0,
    },
    applications: {
      submitted: 0,
      underReview: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
    },
    trends: {
      applicationsThisWeek: 0,
      applicationsLastWeek: 0,
      acceptanceRate: 0,
      conversionRate: 0,
    },
    programs: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/schools/applications');
      
      if (response.ok) {
        const data = await response.json();
        const apps = data.applications || [];
        setAllApplications(apps);
        
        // Calculate financial statistics
        const paidApps = apps.filter((app: any) => app.feePaidCents > 0);
        const totalRevenue = apps.reduce((sum: number, app: any) => sum + (app.feePaidCents || 0), 0);
        const averageFee = paidApps.length > 0 ? totalRevenue / paidApps.length : 0;
        
        // Calculate application statistics
        const applicationStats = {
          submitted: apps.filter((app: any) => app.status === "SUBMITTED").length,
          underReview: apps.filter((app: any) => app.status === "UNDER_REVIEW").length,
          accepted: apps.filter((app: any) => app.status === "ACCEPTED").length,
          rejected: apps.filter((app: any) => app.status === "REJECTED").length,
          waitlisted: apps.filter((app: any) => app.status === "WAITLISTED").length,
        };
        
        // Calculate trends
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const applicationsThisWeek = apps.filter((app: any) => 
          new Date(app.createdAt || app.submittedAt) >= oneWeekAgo
        ).length;
        
        const applicationsLastWeek = apps.filter((app: any) => {
          const date = new Date(app.createdAt || app.submittedAt);
          return date >= twoWeeksAgo && date < oneWeekAgo;
        }).length;
        
        const totalDecided = applicationStats.accepted + applicationStats.rejected;
        const acceptanceRate = totalDecided > 0 ? (applicationStats.accepted / totalDecided) * 100 : 0;
        const conversionRate = apps.length > 0 ? (paidApps.length / apps.length) * 100 : 0;
        
        // Calculate program statistics
        const programCounts: { [key: string]: number } = {};
        apps.forEach((app: any) => {
          const program = app.programName || "Unknown Program";
          programCounts[program] = (programCounts[program] || 0) + 1;
        });
        
        const programs = Object.entries(programCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 programs
        
        setAnalytics({
          financial: {
            totalRevenue,
            totalApplications: apps.length,
            paidApplications: paidApps.length,
            averageFee,
          },
          applications: applicationStats,
          trends: {
            applicationsThisWeek,
            applicationsLastWeek,
            acceptanceRate,
            conversionRate,
          },
          programs,
        });
        
        setDemoMode(false);
      } else {
        // Fallback to demo data
        setAnalytics({
          financial: {
            totalRevenue: 45000000, // 450,000 HTG
            totalApplications: 10,
            paidApplications: 8,
            averageFee: 5625000, // 56,250 HTG
          },
          applications: {
            submitted: 2,
            underReview: 3,
            accepted: 3,
            rejected: 1,
            waitlisted: 1,
          },
          trends: {
            applicationsThisWeek: 3,
            applicationsLastWeek: 2,
            acceptanceRate: 75.0,
            conversionRate: 80.0,
          },
          programs: [
            { name: "Computer Science", count: 4 },
            { name: "Business Administration", count: 3 },
            { name: "Engineering", count: 2 },
            { name: "Medicine", count: 1 },
          ],
        });
        setDemoMode(true);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
      setAnalytics({
        financial: {
          totalRevenue: 45000000,
          totalApplications: 10,
          paidApplications: 8,
          averageFee: 5625000,
        },
        applications: {
          submitted: 2,
          underReview: 3,
          accepted: 3,
          rejected: 1,
          waitlisted: 1,
        },
        trends: {
          applicationsThisWeek: 3,
          applicationsLastWeek: 2,
          acceptanceRate: 75.0,
          conversionRate: 80.0,
        },
        programs: [
          { name: "Computer Science", count: 4 },
          { name: "Business Administration", count: 3 },
          { name: "Engineering", count: 2 },
        ],
      });
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Campus Haiti Analytics Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Financial Overview'],
      ['Metric', 'Value'],
      ['Total Revenue', `${(analytics.financial.totalRevenue / 100).toFixed(2)} HTG`],
      ['Total Applications', analytics.financial.totalApplications.toString()],
      ['Paid Applications', analytics.financial.paidApplications.toString()],
      ['Average Fee', `${(analytics.financial.averageFee / 100).toFixed(2)} HTG`],
      [''],
      ['Application Status'],
      ['Status', 'Count'],
      ['Submitted', analytics.applications.submitted.toString()],
      ['Under Review', analytics.applications.underReview.toString()],
      ['Accepted', analytics.applications.accepted.toString()],
      ['Rejected', analytics.applications.rejected.toString()],
      ['Waitlisted', analytics.applications.waitlisted.toString()],
      [''],
      ['Trends'],
      ['Metric', 'Value'],
      ['Applications This Week', analytics.trends.applicationsThisWeek.toString()],
      ['Applications Last Week', analytics.trends.applicationsLastWeek.toString()],
      ['Acceptance Rate', `${analytics.trends.acceptanceRate.toFixed(1)}%`],
      ['Payment Rate', `${analytics.trends.conversionRate.toFixed(1)}%`],
      [''],
      ['Top Programs'],
      ['Program', 'Applications'],
      ...analytics.programs.map(p => [p.name, p.count.toString()]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">{t("loadingAnalytics")}</p>
      </div>
    );
  }

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
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            {t("exportReport")}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/schools/dashboard">{t("backToDashboard")}</Link>
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("financialOverview")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.financial.totalRevenue / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} HTG
              </div>
              <p className="text-xs text-muted-foreground">
                {t("applicationFee")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalApplications")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.financial.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {t("submitted")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("paidApplications")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.financial.paidApplications}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.financial.totalApplications > 0 
                  ? `${((analytics.financial.paidApplications / analytics.financial.totalApplications) * 100).toFixed(1)}% ${t("paymentRate")}`
                  : t("submitted")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("averageFee")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.financial.averageFee / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} HTG
              </div>
              <p className="text-xs text-muted-foreground">
                {t("paidApplications")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("applicationsByStatus")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("submitted")}</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.submitted}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("underReview")}</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.underReview}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("accepted")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.accepted}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("waitlisted")}</CardTitle>
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.waitlisted}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("rejected")}</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.rejected}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trends & Performance Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("trends")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("applicationsThisWeek")}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.trends.applicationsThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.trends.applicationsThisWeek > analytics.trends.applicationsLastWeek ? (
                  <span className="text-green-600">
                    ↑ {analytics.trends.applicationsThisWeek - analytics.trends.applicationsLastWeek} {t("weeklyChange")}
                  </span>
                ) : analytics.trends.applicationsThisWeek < analytics.trends.applicationsLastWeek ? (
                  <span className="text-red-600">
                    ↓ {analytics.trends.applicationsLastWeek - analytics.trends.applicationsThisWeek} {t("weeklyChange")}
                  </span>
                ) : (
                  <span className="text-gray-600">{t("applicationsLastWeek")}</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("applicationsLastWeek")}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.trends.applicationsLastWeek}</div>
              <p className="text-xs text-muted-foreground">
                {t("applications")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("acceptanceRate")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.trends.acceptanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t("accepted")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("paymentRate")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.trends.conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t("paidApplications")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Program Popularity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("topPrograms")}</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("topPrograms")}</CardTitle>
                <CardDescription>{t("program")}</CardDescription>
              </div>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {analytics.programs.length > 0 ? (
              <div className="space-y-4">
                {analytics.programs.map((program, index) => {
                  const maxCount = analytics.programs[0]?.count || 1;
                  const percentage = (program.count / maxCount) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{program.name}</span>
                        <span className="text-sm text-muted-foreground">{program.count} {t("applications")}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("applications")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("applicationFunnel")}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t("applicationJourney")}</CardTitle>
            <CardDescription>{t("submissionToDecision")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  label: t("totalApplicationsLabel"), 
                  count: analytics.financial.totalApplications, 
                  color: 'bg-blue-500',
                  percentage: 100
                },
                { 
                  label: t("paidApplicationsLabel"), 
                  count: analytics.financial.paidApplications, 
                  color: 'bg-green-500',
                  percentage: analytics.financial.totalApplications > 0 
                    ? (analytics.financial.paidApplications / analytics.financial.totalApplications) * 100 
                    : 0
                },
                { 
                  label: t("underReviewLabel"), 
                  count: analytics.applications.underReview, 
                  color: 'bg-amber-500',
                  percentage: analytics.financial.totalApplications > 0 
                    ? (analytics.applications.underReview / analytics.financial.totalApplications) * 100 
                    : 0
                },
                { 
                  label: t("acceptedLabel"), 
                  count: analytics.applications.accepted, 
                  color: 'bg-green-600',
                  percentage: analytics.financial.totalApplications > 0 
                    ? (analytics.applications.accepted / analytics.financial.totalApplications) * 100 
                    : 0
                },
              ].map((stage, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{stage.label}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className={`${stage.color} h-8 rounded-full transition-all flex items-center justify-end pr-3`}
                        style={{ width: `${stage.percentage}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {stage.count}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-muted-foreground">
                    {stage.percentage.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance Rate</CardTitle>
              <CardDescription>Percentage of applications accepted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {analytics.financial.totalApplications > 0
                  ? `${((analytics.applications.accepted / analytics.financial.totalApplications) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.applications.accepted} accepted out of {analytics.financial.totalApplications} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications Pending Review</CardTitle>
              <CardDescription>Applications waiting for action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-600">
                {analytics.applications.submitted + analytics.applications.underReview}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.applications.submitted} new + {analytics.applications.underReview} under review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
