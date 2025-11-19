"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PasskeyAuth() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegisterPasskey = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t("passkeyRequired"));
      }

      // Get registration options from server
      const optionsRes = await fetch("/api/auth/passkey/register-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const options = await optionsRes.json();

      // Start WebAuthn registration
      const attResp = await startRegistration(options);

      // Verify registration with server
      const verifyRes = await fetch("/api/auth/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, attestationResponse: attResp }),
      });

      if (!verifyRes.ok) {
        throw new Error(t("passkeyVerifyError"));
      }

      alert(t("passkeySuccess"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithPasskey = async () => {
    setLoading(true);
    setError("");

    try {
      // Get authentication options from server
      const optionsRes = await fetch("/api/auth/passkey/auth-options");
      const options = await optionsRes.json();

      // Start WebAuthn authentication
      const asseResp = await startAuthentication(options);

      // Verify authentication with server
      const verifyRes = await fetch("/api/auth/passkey/auth-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assertionResponse: asseResp }),
      });

      if (!verifyRes.ok) {
        throw new Error(t("passkeyAuthError"));
      }

      const { customToken } = await verifyRes.json();
      
      // Sign in with custom token
      const { signInWithCustomToken } = await import("firebase/auth");
      await signInWithCustomToken(auth, customToken);
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSignInWithPasskey}
        className="w-full"
        variant="outline"
        disabled={loading}
      >
        {t("signInWithPasskey")}
      </Button>

      {auth.currentUser && (
        <Button
          onClick={handleRegisterPasskey}
          className="w-full"
          variant="secondary"
          disabled={loading}
        >
          {t("registerPasskey")}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
