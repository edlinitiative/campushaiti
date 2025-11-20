"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

interface SendBulkSMSProps {
  onSuccess?: () => void;
}

export function SendBulkSMS({ onSuccess }: SendBulkSMSProps) {
  const t = useTranslations("admin.sms");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleSendBulkSMS = async () => {
    if (!message.trim()) {
      setResult({
        success: false,
        message: t("messageRequired"),
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/notifications/sms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, recipientType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send bulk SMS");
      }

      setResult({
        success: true,
        message: t("bulkSmsSentSuccess", {
          count: data.recipientCount,
          sent: data.sentCount,
        }),
        details: data,
      });

      setMessage("");
      onSuccess?.();
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || t("bulkSmsSentError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 160;
  const messageCount = Math.ceil(characterCount / maxCharacters) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sendBulkSmsTitle")}</CardTitle>
        <CardDescription>{t("sendBulkSmsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="recipients">{t("recipients")}</Label>
          <RadioGroup
            id="recipients"
            value={recipientType}
            onValueChange={setRecipientType}
            disabled={loading}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer">
                {t("recipientsAll")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="applicants" id="applicants" />
              <Label htmlFor="applicants" className="font-normal cursor-pointer">
                {t("recipientsApplicants")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="verified" />
              <Label htmlFor="verified" className="font-normal cursor-pointer">
                {t("recipientsVerified")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="message">{t("message")}</Label>
            <span className="text-xs text-muted-foreground">
              {characterCount}/{maxCharacters} ({messageCount} {t("messageSegments")})
            </span>
          </div>
          <Textarea
            id="message"
            placeholder={t("messagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            rows={5}
            maxLength={maxCharacters * 3}
          />
          <p className="text-xs text-muted-foreground">
            {t("messageHelp")}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{t("demoModeWarning")}</strong> {t("demoModeDescription")}
          </p>
        </div>

        <Button
          onClick={handleSendBulkSMS}
          disabled={loading || !message.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t("sendBulkSms")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
