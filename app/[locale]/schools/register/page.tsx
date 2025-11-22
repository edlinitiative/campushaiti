"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

export default function RegisterSchoolPage() {
  const t = useTranslations("schools.register");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // University info
    name: "",
    slug: "",
    city: "",
    country: "Haiti",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    description: "",
    
    // Contact person
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    contactPersonTitle: "",
    
    // Legal info
    registrationNumber: "",
    taxId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Submit registration via API
      const response = await fetch("/api/schools/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit registration");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/en");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting registration:", err);
      setError(err.message || "Failed to submit registration");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">✓ {t("registrationSubmitted")}</CardTitle>
            <CardDescription>
              {t("thankYouMessage")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("emailNotification", { email: formData.contactEmail })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {/* University Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("universityInformation")}</CardTitle>
            <CardDescription>{t("universityInformationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("universityName")} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Université d'État d'Haïti"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t("urlSlug")} *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="universite-etat-haiti"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t("urlSlugHint", { slug: formData.slug })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t("city")} *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Port-au-Prince"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("country")} *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">{t("websiteUrl")}</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://www.youruni.edu.ht"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("contactEmail")} *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="admissions@youruni.edu.ht"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t("contactPhone")}</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+509 1234 5678"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Person */}
        <Card>
          <CardHeader>
            <CardTitle>{t("contactPerson")}</CardTitle>
            <CardDescription>{t("contactPersonDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">{t("fullName")} *</Label>
                <Input
                  id="contactPersonName"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="Jean Baptiste"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonTitle">{t("titlePosition")}</Label>
                <Input
                  id="contactPersonTitle"
                  name="contactPersonTitle"
                  value={formData.contactPersonTitle}
                  onChange={handleChange}
                  placeholder="Admissions Director"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">{t("email")} *</Label>
                <Input
                  id="contactPersonEmail"
                  name="contactPersonEmail"
                  type="email"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  placeholder="j.baptiste@youruni.edu.ht"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">{t("phone")}</Label>
                <Input
                  id="contactPersonPhone"
                  name="contactPersonPhone"
                  type="tel"
                  value={formData.contactPersonPhone}
                  onChange={handleChange}
                  placeholder="+509 1234 5678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("legalInformation")}</CardTitle>
            <CardDescription>{t("legalInformationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">{t("registrationNumber")}</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="MENFP-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">{t("taxId")}</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="123-456-789"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("submitting") : t("submitRegistration")}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {t("agreementText")}
        </p>
      </form>
    </div>
  );
}
