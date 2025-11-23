"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useParams } from "next/navigation";

export default function GoogleAuth() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string || "en";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      console.log("Starting Google sign-in...");
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful:", result.user.email);
      
      // Create server-side session
      const idToken = await result.user.getIdToken();
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

      console.log("Session created, getting redirect URL...");
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
      console.log("Redirecting to:", finalUrl);
      window.location.href = finalUrl;    } catch (err: any) {
      console.error("Google sign-in error:", err.code, err.message);
      let errorMessage = err.message;
      
      // Firebase error code translations
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = t("popupClosed");
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = t("popupCancelled");
      } else if (err.code === "auth/popup-blocked") {
        errorMessage = t("popupBlocked");
      } else if (err.code === "auth/unauthorized-domain") {
        errorMessage = "This domain is not authorized. Please add it to Firebase Console → Authentication → Settings → Authorized domains";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = t("accountExistsWithDifferentCredential");
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
      <Button
        onClick={handleGoogleSignIn}
        className="w-full"
        variant="outline"
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? t("loading") : t("continueWithGoogle")}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
