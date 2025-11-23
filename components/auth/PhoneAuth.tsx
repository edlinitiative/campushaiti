"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function PhoneAuth() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string || "en";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        }
      );
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      
      window.confirmationResult = confirmationResult;
      setCodeSent(true);
    } catch (err: any) {
      let errorMessage = err.message;
      
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = t("invalidPhoneNumber");
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = t("tooManyAttempts");
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!window.confirmationResult) {
        throw new Error(t("noCodeSent"));
      }

      const userCredential = await window.confirmationResult.confirm(verificationCode);
      
      // Create server-side session
      const idToken = await userCredential.user.getIdToken();
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionResponse.ok) {
        let errorData;
        try {
          errorData = await sessionResponse.json();
        } catch (e) {
          console.error("Failed to parse error response:", e);
          throw new Error(`Session creation failed with status ${sessionResponse.status}`);
        }
        console.error("Session creation failed:", errorData);
        throw new Error(errorData.error || "Failed to create session");
      }

      // Get role-based redirect URL
      const redirectResponse = await fetch("/api/auth/redirect");
      
      if (!redirectResponse.ok) {
        console.error("Redirect endpoint failed:", redirectResponse.status);
        // Fallback to default dashboard
        window.location.href = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
        return;
      }
      
      let redirectData;
      try {
        redirectData = await redirectResponse.json();
      } catch (e) {
        console.error("Failed to parse redirect response:", e);
        // Fallback to default dashboard
        window.location.href = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
        return;
      }
      
      const redirectUrl = redirectData.redirectUrl || "/dashboard";
      const finalUrl = locale === "en" ? redirectUrl : `/${locale}${redirectUrl}`;
      window.location.href = finalUrl;    } catch (err: any) {
      let errorMessage = err.message;
      
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = t("invalidVerificationCode");
      } else if (err.code === "auth/code-expired") {
        errorMessage = t("codeExpired");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCodeSent(false);
    setVerificationCode("");
    setError("");
  };

  return (
    <div className="space-y-4">
      <div id="recaptcha-container"></div>
      
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phoneNumber")}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phoneNumberPlaceholder")}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {t("phoneNumberFormat")}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("loading") : t("sendCode")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("verificationCode")}</Label>
            <Input
              id="code"
              type="text"
              placeholder={t("verificationCodePlaceholder")}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              {t("codeSentTo", { phone: phoneNumber })}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("loading") : t("verifyCode")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendCode}
            disabled={loading}
          >
            {t("resendCode")}
          </Button>
        </form>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
