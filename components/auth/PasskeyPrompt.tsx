"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { startRegistration } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PASSKEY_PROMPT_KEY = "passkey_prompt_shown";

export default function PasskeyPrompt() {
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user just signed in and hasn't seen the prompt
    const user = auth.currentUser;
    const promptShown = localStorage.getItem(PASSKEY_PROMPT_KEY);
    
    if (user && !promptShown) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

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

      // Mark prompt as shown
      localStorage.setItem(PASSKEY_PROMPT_KEY, "true");
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(PASSKEY_PROMPT_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("passkeyPromptTitle")}</DialogTitle>
          <DialogDescription>
            {t("passkeyPromptDescription")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t("skipForNow")}
          </Button>
          <Button
            onClick={handleRegisterPasskey}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? t("loading") : t("registerPasskey")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
