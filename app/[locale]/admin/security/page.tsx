"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, Download, Search, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

interface AuditLog {
  action: string;
  severity: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  timestamp: any;
  success: boolean;
  errorMessage?: string;
  details?: any;
}

export default function AdminSecurityPage() {
  const t = useTranslations("security");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.append("startDate", startDate.toISOString());
      }
      
      params.append("limit", "200");

      const response = await fetch(`/api/audit-logs?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterSeverity !== "all" && log.severity !== filterSeverity) return false;
    if (searchTerm && !log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge className="bg-red-600">{t("critical")}</Badge>;
      case "ERROR":
        return <Badge className="bg-red-500">{t("error")}</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500">{t("warning")}</Badge>;
      default:
        return <Badge variant="secondary">{t("info")}</Badge>;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Action", "Severity", "User", "IP", "Success", "Details"].join(","),
      ...filteredLogs.map(log => [
        new Date(log.timestamp?.seconds * 1000 || log.timestamp).toISOString(),
        log.action,
        log.severity,
        log.userEmail || log.userId || "",
        log.ipAddress || "",
        log.success,
        log.errorMessage || "",
      ].join(","))
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToDashboard")}
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t("exportLogs")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalEvents")}</CardDescription>
            <CardTitle className="text-3xl">{logs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t(dateRange === "7d" ? "last7Days" : dateRange === "30d" ? "last30Days" : "allTime")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("successful")}</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {logs.filter(l => l.success).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {logs.length > 0 ? ((logs.filter(l => l.success).length / logs.length) * 100).toFixed(1) : 0}% {t("successRate")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("failures")}</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {logs.filter(l => !l.success).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("requiresAttention")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("securityWarnings")}</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {logs.filter(l => ["WARNING", "CRITICAL", "ERROR"].includes(l.severity)).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("elevatedSeverity")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("filterLogs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">{t("last24Hours")}</SelectItem>
                <SelectItem value="7d">{t("last7Days")}</SelectItem>
                <SelectItem value="30d">{t("last30Days")}</SelectItem>
                <SelectItem value="all">{t("allTime")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder={t("allSeverities")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSeverities")}</SelectItem>
                <SelectItem value="INFO">{t("info")}</SelectItem>
                <SelectItem value="WARNING">{t("warning")}</SelectItem>
                <SelectItem value="ERROR">{t("error")}</SelectItem>
                <SelectItem value="CRITICAL">{t("critical")}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadAuditLogs}>
              {t("refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("auditLogEntries")}</CardTitle>
          <CardDescription>
            {t("showing", { count: filteredLogs.length, total: logs.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">{t("loading")}</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t("noLogsFound")}</p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.success)}
                      <div>
                        <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.userEmail || log.userId || "System"}
                          {log.ipAddress && ` • ${log.ipAddress}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(log.severity)}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {log.errorMessage && (
                    <div className="mt-2 text-sm text-red-600 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <span>{log.errorMessage}</span>
                    </div>
                  )}
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
