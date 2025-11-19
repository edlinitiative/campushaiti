"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { startRegistration } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Fingerprint, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Passkey {
  id: string;
  credentialID: string;
  createdAt: Date;
  lastUsed?: Date;
  device?: string;
}

export default function PasskeyManager() {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const fetchPasskeys = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(`/api/auth/passkey/list?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setPasskeys(data.passkeys || []);
      }
    } catch (err) {
      console.error("Error fetching passkeys:", err);
    }
  };

  const handleAddPasskey = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t("notAuthenticated"));
      }

      // Get registration options
      const optionsRes = await fetch("/api/auth/passkey/register-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.error || "Failed to get registration options");
      }

      const options = await optionsRes.json();

      if (!options || !options.challenge) {
        throw new Error("Invalid registration options");
      }

      // Start WebAuthn registration
      const attResp = await startRegistration(options);

      // Verify registration
      const verifyRes = await fetch("/api/auth/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, attestationResponse: attResp }),
      });

      if (!verifyRes.ok) {
        throw new Error("Failed to verify passkey");
      }

      // Refresh list
      await fetchPasskeys();
    } catch (err: any) {
      console.error("Add passkey error:", err);
      setError(err.message || t("passkeyAddError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch("/api/auth/passkey/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, passkeyId: id }),
      });

      if (response.ok) {
        await fetchPasskeys();
      }
    } catch (err) {
      console.error("Error deleting passkey:", err);
      setError(t("passkeyDeleteError"));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t("passkeysCount", { count: passkeys.length })}
        </p>
        <Button onClick={handleAddPasskey} disabled={loading} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t("addPasskey")}
        </Button>
      </div>

      {passkeys.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Fingerprint className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t("noPasskeys")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {passkey.device || t("passkeyDevice")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("added")}: {new Date(passkey.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(passkey.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deletePasskeyTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deletePasskeyDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDeletePasskey(deleteId)}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
