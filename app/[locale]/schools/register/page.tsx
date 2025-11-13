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
import { db } from "@/lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";

export default function RegisterSchoolPage() {
  const t = useTranslations("school");
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
      // Create registration request
      await addDoc(collection(db, "universityRegistrations"), {
        ...formData,
        status: "PENDING",
        submittedBy: "anonymous", // Will be updated when we have auth
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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
            <CardTitle className="text-green-600">✓ Registration Submitted!</CardTitle>
            <CardDescription>
              Thank you for registering your university. Our team will review your application and contact you within 2-3 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You will receive an email at <strong>{formData.contactEmail}</strong> once your registration is approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Register Your University</h1>
        <p className="text-muted-foreground">
          Join Campus Haiti to reach qualified applicants across Haiti and the diaspora.
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
            <CardTitle>University Information</CardTitle>
            <CardDescription>Basic information about your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name *</Label>
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
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="universite-etat-haiti"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Will appear in URL: campushaiti.com/universities/{formData.slug}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
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
                <Label htmlFor="country">Country *</Label>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your university..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
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
                <Label htmlFor="contactEmail">Contact Email *</Label>
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
              <Label htmlFor="contactPhone">Contact Phone</Label>
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
            <CardTitle>Contact Person</CardTitle>
            <CardDescription>Primary contact for this registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Full Name *</Label>
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
                <Label htmlFor="contactPersonTitle">Title/Position</Label>
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
                <Label htmlFor="contactPersonEmail">Email *</Label>
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
                <Label htmlFor="contactPersonPhone">Phone</Label>
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
            <CardTitle>Legal Information</CardTitle>
            <CardDescription>Official registration details (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="MENFP-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / NIF</Label>
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
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Registration"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          By submitting this form, you agree to our Terms of Service and acknowledge that your information will be reviewed by our team.
        </p>
      </form>
    </div>
  );
}
