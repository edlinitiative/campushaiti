"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { auth } from "@/lib/firebase/client";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setStatus("error");
        setError(t("invalidLink"));
        return;
      }

      try {
        let email = window.localStorage.getItem("emailForSignIn");
        
        if (!email) {
          email = window.prompt(t("emailPrompt"));
        }

        if (!email) {
          throw new Error(t("emailRequired"));
        }

        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("emailForSignIn");

        // Get ID token and create session
        const idToken = await result.user.getIdToken();
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || errorData.details || t("sessionError");
          console.error("Session creation failed:", errorData);
          throw new Error(errorMsg);
        }

        setStatus("success");
        // Wait longer to ensure cookie is set
        const dashboardPath = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
        setTimeout(() => router.push(dashboardPath), 2000);
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setError(err.message || t("unexpectedError"));
      }
    };

    verifyEmail();
  }, [router, locale, t]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {status === "verifying" && <p>{t("verifying")}</p>}
      {status === "success" && <p className="text-green-600">{t("success")}</p>}
      {status === "error" && <p className="text-red-600">{t("error")}: {error}</p>}
    </div>
  );
}
