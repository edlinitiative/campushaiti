"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, MessageSquare, Users, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  message: string;
  phoneNumber?: string;
  recipientCount?: number;
  sentCount?: number;
  failedCount?: number;
  status: string;
  type: string;
  notificationType: "single" | "bulk";
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
}

export function SMSHistory() {
  const t = useTranslations("admin.sms");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/sms/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setNotifications(data.notifications || []);
      setStats(data.stats || { totalSent: 0, totalFailed: 0, totalPending: 0 });
    } catch (error) {
      console.error("Error fetching SMS history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      pending: "secondary",
      failed: "destructive",
      processing: "outline",
      completed: "default",
    };

    const statusLabels: Record<string, string> = {
      sent: t("statusSent"),
      pending: t("statusPending"),
      failed: t("statusFailed"),
      processing: t("statusProcessing"),
      completed: t("statusCompleted"),
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("totalSent")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Send className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold">{stats.totalSent}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("totalPending")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold">{stats.totalPending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("totalFailed")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-red-500" />
              <span className="text-3xl font-bold">{stats.totalFailed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("smsHistoryTitle")}</CardTitle>
              <CardDescription>{t("smsHistoryDescription")}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noNotifications")}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("type")}</TableHead>
                    <TableHead>{t("message")}</TableHead>
                    <TableHead>{t("recipient")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("createdAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        {notification.notificationType === "bulk" ? (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{t("bulk")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{t("single")}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {truncateMessage(notification.message)}
                      </TableCell>
                      <TableCell>
                        {notification.notificationType === "bulk" ? (
                          <span>
                            {notification.recipientCount} {t("recipientsList")}
                            {notification.sentCount !== undefined && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({notification.sentCount} {t("sent")})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="font-mono text-sm">
                            {notification.phoneNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
