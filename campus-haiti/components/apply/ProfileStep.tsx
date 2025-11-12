"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileStepProps {
  onNext: () => void;
}

export default function ProfileStep({ onNext }: ProfileStepProps) {
  const t = useTranslations("apply.profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationality: "",
    birthDate: "",
    personalStatement: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            nationality: data.nationality || "",
            birthDate: data.birthDate?.toDate?.()?.toISOString().split("T")[0] || "",
            personalStatement: data.essays?.personalStatement || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      await setDoc(
        doc(db, "profiles", user.uid),
        {
          uid: user.uid,
          phone: formData.phone,
          nationality: formData.nationality,
          birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
          essays: {
            personalStatement: formData.personalStatement,
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Also update user name
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          name: formData.name,
          role: "APPLICANT",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>Please complete your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="nationality">{t("nationality")}</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="birthDate">{t("birthDate")}</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="personalStatement">{t("personalStatement")}</Label>
            <Textarea
              id="personalStatement"
              rows={5}
              value={formData.personalStatement}
              onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save & Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
