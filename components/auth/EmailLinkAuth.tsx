"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useParams } from "next/navigation";

export default function EmailLinkAuth() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string || "en";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Use as-needed locale behavior: English doesn't need /en prefix
      const verifyPath = locale === "en" ? "/auth/verify" : `/${locale}/auth/verify`;
      const actionCodeSettings = {
        url: `${window.location.origin}${verifyPath}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setMessage(t("checkEmail"));
    } catch (err: any) {
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSendLink} className="space-y-4">
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("loading") : t("sendLink")}
        </Button>
      </form>
      
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
