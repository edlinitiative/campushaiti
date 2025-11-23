"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PasswordAuthProps {
  mode?: "signin" | "signup";
  onSuccess?: () => void;
}

export default function PasswordAuth({ mode = "signin", onSuccess }: PasswordAuthProps) {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string || "en";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (mode === "signup") {
        if (password !== confirmPassword) {
          throw new Error(t("passwordMismatch"));
        }
        if (password.length < 6) {
          throw new Error(t("passwordTooShort"));
        }
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

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

      if (onSuccess) {
        onSuccess();
      } else {
        // Get role-based redirect URL
        const redirectResponse = await fetch("/api/auth/redirect", {
          method: "GET",
        });
        
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
        window.location.href = finalUrl;
      }
    } catch (err: any) {
      let errorMessage = err.message;
      
      // Firebase error code translations
      if (err.code === "auth/email-already-in-use") {
        errorMessage = t("emailInUse");
      } else if (err.code === "auth/invalid-email") {
        errorMessage = t("invalidEmail");
      } else if (err.code === "auth/user-not-found") {
        errorMessage = t("userNotFound");
      } else if (err.code === "auth/wrong-password") {
        errorMessage = t("wrongPassword");
      } else if (err.code === "auth/weak-password") {
        errorMessage = t("passwordTooShort");
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = t("tooManyAttempts");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("loading") : mode === "signup" ? t("signUp") : t("signIn")}
        </Button>
      </form>

      {mode === "signin" && (
        <div className="text-center text-sm">
          <Link
            href={locale === "en" ? "/auth/forgot-password" : `/${locale}/auth/forgot-password`}
            className="text-primary hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
