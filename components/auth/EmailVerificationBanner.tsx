"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { sendEmailVerification } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EmailVerificationBanner() {
  const t = useTranslations("auth");
  const [user, setUser] = useState(auth.currentUser);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let wasUnverified = false;
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      // Track if user was previously unverified
      if (currentUser && !currentUser.emailVerified) {
        wasUnverified = true;
      }
      
      // Only reload if user just became verified (was unverified, now verified)
      if (currentUser?.emailVerified && wasUnverified) {
        window.location.reload();
        return;
      }
      
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSendVerification = async () => {
    if (!user) return;

    setSending(true);
    setMessage("");

    try {
      await sendEmailVerification(user);
      setMessage(t("verificationEmailSent"));
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      setMessage(t("verificationEmailError"));
    } finally {
      setSending(false);
    }
  };

  // Don't show if user is verified, not authenticated, or dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  // Don't show for phone-only users (no email)
  if (!user.email) {
    return null;
  }

  return (
    <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {t("emailNotVerified")}
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSendVerification}
                disabled={sending}
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                {sending ? t("sending") : t("resendVerification")}
              </Button>
            </div>
            {message && (
              <p className="mt-2 text-sm font-medium">{message}</p>
            )}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="ml-4 h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
