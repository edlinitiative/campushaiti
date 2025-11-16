"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText, CheckCircle, Users, Clock, XCircle, AlertCircle } from "lucide-react";

export default function SchoolAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
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
        
        setAnalytics({
          financial: {
            totalRevenue,
            totalApplications: apps.length,
            paidApplications: paidApps.length,
            averageFee,
          },
          applications: applicationStats,
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
      });
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">Loading analytics...</p>
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
              <h3 className="font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800 mb-2">
                You&apos;re viewing sample analytics data. To see real analytics, please{' '}
                <Link href="/auth/signin" className="underline font-medium">sign in</Link>
                {' '}or{' '}
                <Link href="/schools/register" className="underline font-medium">register your institution</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Track your institution&apos;s application and revenue metrics</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/schools/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                From application fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.financial.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Applications</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.financial.paidApplications}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.financial.totalApplications > 0 
                  ? `${((analytics.financial.paidApplications / analytics.financial.totalApplications) * 100).toFixed(1)}% payment rate`
                  : 'No applications yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
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
                Per application
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Application Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.submitted}</div>
              <p className="text-xs text-muted-foreground">
                New applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.underReview}</div>
              <p className="text-xs text-muted-foreground">
                Being reviewed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.accepted}</div>
              <p className="text-xs text-muted-foreground">
                Approved applicants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlisted</CardTitle>
              <AlertCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.waitlisted}</div>
              <p className="text-xs text-muted-foreground">
                On waitlist
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.applications.rejected}</div>
              <p className="text-xs text-muted-foreground">
                Not accepted
              </p>
            </CardContent>
          </Card>
        </div>
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
