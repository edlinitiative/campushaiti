"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string || "en";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t("resetEmailSent"));
    } catch (err: any) {
      let errorMessage = err.message;
      
      if (err.code === "auth/user-not-found") {
        errorMessage = t("userNotFound");
      } else if (err.code === "auth/invalid-email") {
        errorMessage = t("invalidEmail");
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = t("tooManyAttempts");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("forgotPassword")}</CardTitle>
            <CardDescription>{t("resetPasswordDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("loading") : t("sendResetLink")}
              </Button>
            </form>

            {message && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <Link
            href={locale === "en" ? "/auth/signin" : `/${locale}/auth/signin`}
            className="text-primary hover:underline"
          >
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
