"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client";
import { updateProfile, updateEmail, sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProfileFormProps {
  user: any;
}

export default function ProfileForm({ user: serverUser }: ProfileFormProps) {
  const t = useTranslations("settings");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
      setEmailVerified(user.emailVerified);
      
      // Fetch phone number from Firestore
      fetchPhoneNumber(user.uid);
    }
  }, []);

  const fetchPhoneNumber = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPhoneNumber(data.phoneNumber || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update display name in Firebase Auth
      if (fullName !== user.displayName) {
        await updateProfile(user, { displayName: fullName });
      }

      // Update email if changed
      if (email !== user.email && email) {
        await updateEmail(user, email);
        // Send verification email to new address
        await sendEmailVerification(user);
        setEmailVerified(false);
      }

      // Update phone number via API
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          phoneNumber,
          fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setSuccess(t("profileUpdated"));
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.message || t("profileUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      await sendEmailVerification(user);
      setSuccess(t("verificationEmailSent"));
    } catch (err: any) {
      setError(err.message || t("verificationEmailError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          {t("email")}
          {emailVerified ? (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t("verified")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              <XCircle className="w-3 h-3 mr-1" />
              {t("unverified")}
            </Badge>
          )}
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        {!emailVerified && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendVerification}
            disabled={loading}
          >
            {t("sendVerificationEmail")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={loading}
          placeholder="+50938123456"
        />
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
