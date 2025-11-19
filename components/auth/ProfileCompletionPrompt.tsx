"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROFILE_COMPLETE_KEY = "profile_complete";

export default function ProfileCompletionPrompt() {
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      const profileComplete = localStorage.getItem(PROFILE_COMPLETE_KEY);
      
      if (user && !profileComplete) {
        // Check if user signed in with Google (has photoURL but no phone)
        const isGoogleUser = user.providerData.some(
          (provider) => provider.providerId === "google.com"
        );
        
        if (isGoogleUser && !user.phoneNumber) {
          // Show profile completion prompt after a short delay
          setTimeout(() => {
            setFullName(user.displayName || "");
            setOpen(true);
          }, 1500);
        }
      }
    };

    checkProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t("passkeyRequired"));
      }

      // Update user profile with phone number
      // Note: Firebase Auth doesn't directly support updating phoneNumber via updateProfile
      // We'll store it in Firestore instead
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");
      const db = getFirestore();
      
      await setDoc(
        doc(db, "users", user.uid),
        {
          phoneNumber,
          fullName,
          email: user.email,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Update display name if provided
      if (fullName && fullName !== user.displayName) {
        await updateProfile(user, { displayName: fullName });
      }

      // Mark profile as complete
      localStorage.setItem(PROFILE_COMPLETE_KEY, "true");
      setOpen(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || t("profileUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(PROFILE_COMPLETE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("completeProfile")}</DialogTitle>
          <DialogDescription>
            {t("completeProfileDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t("fullNamePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t("phoneNumber")}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("phoneNumberPlaceholder")}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {t("phoneNumberFormat")}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("skipForNow")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? t("loading") : t("saveProfile")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
