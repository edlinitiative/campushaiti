"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import DashboardKPIs from "@/components/uni/DashboardKPIs";
import ApplicationFunnel from "@/components/uni/ApplicationFunnel";
import ProgramPerformance from "@/components/uni/ProgramPerformance";

export default function SchoolAnalyticsPage() {
  const t = useTranslations("schools.analytics");

  const handleExport = async () => {
    try {
      // Fetch all analytics data
      const [overview, funnel, programs] = await Promise.all([
        fetch("/api/uni/analytics/overview").then((r) => r.json()),
        fetch("/api/uni/analytics/funnel").then((r) => r.json()),
        fetch("/api/uni/analytics/programs").then((r) => r.json()),
      ]);

      // Prepare CSV data
      const csvData = [
        ["Campus Haiti Analytics Report"],
        [`Generated: ${new Date().toLocaleString()}`],
        [""],
        ["Dashboard Overview"],
        ["Metric", "Value"],
        ["Total Applications", overview.totalApplications?.toString() || "0"],
        ["New Applications", overview.newApplications?.toString() || "0"],
        ["In Review", overview.inReview?.toString() || "0"],
        ["Accepted", overview.accepted?.toString() || "0"],
        ["Rejected", overview.rejected?.toString() || "0"],
        ["Acceptance Rate", `${overview.acceptanceRate?.toFixed(1) || 0}%`],
        [
          "Avg Processing Time",
          `${overview.averageProcessingDays?.toFixed(1) || 0} days`,
        ],
        [
          "Total Revenue",
          `$${((overview.totalRevenue || 0) / 100).toFixed(2)}`,
        ],
        ["Pending Payments", overview.pendingPayments?.toString() || "0"],
        [""],
        ["Application Funnel"],
        ["Status", "Count", "Percentage"],
        ...(funnel.funnel || []).map((item: any) => [
          item.status,
          item.count.toString(),
          `${item.percentage.toFixed(1)}%`,
        ]),
        [""],
        ["Program Performance"],
        ["Program", "Applications", "Accepted", "Rejected", "Acceptance Rate"],
        ...(programs.programs || []).map((p: any) => [
          p.programName,
          p.applications.toString(),
          p.accepted.toString(),
          p.rejected.toString(),
          `${p.acceptanceRate}%`,
        ]),
      ];

      // Convert to CSV
      const csv = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting analytics:", error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title") || "Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle") ||
              "Comprehensive insights into your application pipeline"}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t("exportData") || "Export Data"}
        </Button>
      </div>

      <DashboardKPIs />

      <div className="grid gap-6 md:grid-cols-2">
        <ApplicationFunnel />
        <ProgramPerformance />
      </div>
    </div>
  );
}

