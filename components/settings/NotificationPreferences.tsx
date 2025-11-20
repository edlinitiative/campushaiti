"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Bell, Mail, MessageSquare, Calendar, Megaphone } from "lucide-react";

export function NotificationPreferences() {
  const t = useTranslations("settings.notifications");
  const [preferences, setPreferences] = useState({
    smsEnabled: true,
    emailEnabled: true,
    applicationUpdates: true,
    deadlineReminders: true,
    announcements: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (!response.ok) throw new Error("Failed to fetch preferences");
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error("Failed to save preferences");

      setMessage({
        type: "success",
        text: t("preferencesUpdated"),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: t("preferencesUpdateError"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>{t("title")}</span>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">{t("channels")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="smsEnabled">{t("sms")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("smsDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="smsEnabled"
                  checked={preferences.smsEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, smsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="emailEnabled">{t("email")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("emailDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">{t("notificationTypes")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="applicationUpdates">
                      {t("applicationUpdates")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("applicationUpdatesDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="applicationUpdates"
                  checked={preferences.applicationUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, applicationUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="deadlineReminders">
                      {t("deadlineReminders")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("deadlineRemindersDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="deadlineReminders"
                  checked={preferences.deadlineReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, deadlineReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="announcements">{t("announcements")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("announcementsDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="announcements"
                  checked={preferences.announcements}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, announcements: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("savePreferences")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
