"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
        return <Badge className="bg-red-600">Critical</Badge>;
      case "ERROR":
        return <Badge className="bg-red-500">Error</Badge>;
      case "WARNING":
        return <Badge className="bg-amber-500">Warning</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
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
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Security & Audit Logs
            </h1>
            <p className="text-muted-foreground">Monitor system security and user activity</p>
          </div>
          <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl">{logs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last {dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : "all time"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Successful</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {logs.filter(l => l.success).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {logs.length > 0 ? ((logs.filter(l => l.success).length / logs.length) * 100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failures</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {logs.filter(l => !l.success).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Security Warnings</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {logs.filter(l => ["WARNING", "CRITICAL", "ERROR"].includes(l.severity)).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Elevated severity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user or IP..."
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
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadAuditLogs}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading audit logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No audit logs found</p>
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
