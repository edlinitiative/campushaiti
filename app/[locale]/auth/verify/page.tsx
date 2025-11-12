"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setStatus("error");
        setError("Invalid link");
        return;
      }

      try {
        let email = window.localStorage.getItem("emailForSignIn");
        
        if (!email) {
          email = window.prompt("Please provide your email for confirmation");
        }

        if (!email) {
          throw new Error("Email required");
        }

        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("emailForSignIn");

        // Get ID token and create session
        const idToken = await result.user.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err: any) {
        setStatus("error");
        setError(err.message);
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && <p className="text-green-600">Success! Redirecting...</p>}
      {status === "error" && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}
