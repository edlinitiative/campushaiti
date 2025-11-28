"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface KPIData {
  totalApplications: number;
  newApplications: number;
  inReview: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  averageProcessingDays: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function DashboardKPIs() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const res = await fetch("/api/uni/analytics/overview");
        if (!res.ok) throw new Error("Failed to fetch KPIs");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching KPIs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load analytics data
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Applications",
      value: data.totalApplications.toLocaleString(),
      icon: Users,
      description: "All applications",
    },
    {
      title: "New Applications",
      value: data.newApplications.toLocaleString(),
      icon: AlertCircle,
      description: "Awaiting review",
      iconColor: "text-orange-500",
    },
    {
      title: "In Review",
      value: data.inReview.toLocaleString(),
      icon: Clock,
      description: "Under evaluation",
      iconColor: "text-blue-500",
    },
    {
      title: "Accepted",
      value: data.accepted.toLocaleString(),
      icon: CheckCircle,
      description: "Approved applications",
      iconColor: "text-green-500",
    },
    {
      title: "Acceptance Rate",
      value: `${data.acceptanceRate}%`,
      icon: data.acceptanceRate >= 50 ? TrendingUp : TrendingDown,
      description: "Accepted / Total decided",
      iconColor: data.acceptanceRate >= 50 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Avg Processing Time",
      value: `${data.averageProcessingDays} days`,
      icon: Clock,
      description: "Time to decision",
      iconColor: data.averageProcessingDays <= 7 ? "text-green-500" : "text-orange-500",
    },
    {
      title: "Total Revenue",
      value: `$${(data.totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Paid applications",
      iconColor: "text-green-500",
    },
    {
      title: "Pending Payments",
      value: data.pendingPayments.toLocaleString(),
      icon: AlertCircle,
      description: "Awaiting payment",
      iconColor: data.pendingPayments > 0 ? "text-orange-500" : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <Icon className={`h-4 w-4 ${kpi.iconColor || "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
