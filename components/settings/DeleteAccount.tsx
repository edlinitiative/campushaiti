"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  deleteUser 
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function DeleteAccount() {
  const t = useTranslations("settings");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t("notAuthenticated"));
      }

      // Check if user signed in with password (requires re-authentication)
      const hasPasswordProvider = user.providerData.some(
        (provider) => provider.providerId === "password"
      );

      if (hasPasswordProvider && !password) {
        throw new Error(t("passwordRequired"));
      }

      // Re-authenticate if password provider
      if (hasPasswordProvider && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete user data from Firestore
      await fetch("/api/user/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      // Delete Firebase Auth user
      await deleteUser(user);

      // Redirect to home
      router.push("/");
    } catch (err: any) {
      console.error("Delete account error:", err);
      
      // Handle specific Firebase errors
      if (err.code === "auth/wrong-password") {
        setError(t("wrongPassword"));
      } else if (err.code === "auth/requires-recent-login") {
        setError(t("requiresRecentLogin"));
      } else {
        setError(err.message || t("deleteAccountError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const user = auth.currentUser;
  const hasPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t("deleteAccountWarning")}
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-destructive/50 p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-destructive mb-2">
            {t("deleteAccountTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("deleteAccountDescription")}
          </p>
        </div>

        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              {t("deleteAccount")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmDeleteDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {hasPasswordProvider && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("confirmPassword")}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>
                {t("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={loading || (hasPasswordProvider && !password)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? t("deleting") : t("confirmDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
