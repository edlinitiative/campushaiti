"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewProgramPage() {
  const t = useTranslations("schools.programs");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    degree: "BACHELOR",
    description: "",
    requirements: "",
    feeCents: "",
    currency: "HTG",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/schools/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          feeCents: parseInt(formData.feeCents) * 100, // Convert to cents
          deadline: new Date(formData.deadline),
        }),
      });

      if (response.ok) {
        router.push("/schools/dashboard/programs");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create program");
      }
    } catch (err) {
      console.error("Error creating program:", err);
      alert("Failed to create program. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/schools/dashboard/programs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToPrograms")}
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("newProgramTitle")}</CardTitle>
            <CardDescription>
              {t("newProgramDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("programName")} {t("required")}</Label>
                <Input
                  id="name"
                  placeholder={t("programNamePlaceholder")}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">{t("degreeType")} {t("required")}</Label>
                <Select value={formData.degree} onValueChange={(value) => handleChange("degree", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELOR">{t("bachelorDegree")}</SelectItem>
                    <SelectItem value="MASTER">{t("masterDegree")}</SelectItem>
                    <SelectItem value="DOCTORATE">{t("doctorateDegree")}</SelectItem>
                    <SelectItem value="ASSOCIATE">{t("associateDegree")}</SelectItem>
                    <SelectItem value="CERTIFICATE">{t("certificateProgram")}</SelectItem>
                    <SelectItem value="DIPLOMA">{t("diplomaProgram")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("descriptionRequired")} {t("required")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("descriptionLongPlaceholder")}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t("descriptionHelp")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">{t("requirementsRequired")} {t("required")}</Label>
                <Textarea
                  id="requirements"
                  placeholder={t("requirementsLongPlaceholder")}
                  value={formData.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeCents">{t("feeAmount")} {t("required")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="feeCents"
                      type="number"
                      placeholder="0"
                      value={formData.feeCents}
                      onChange={(e) => handleChange("feeCents", e.target.value)}
                      required
                      min="0"
                    />
                    <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HTG">HTG</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("feeHelp")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">{t("applicationDeadline")} {t("required")}</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("deadlineHelp")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t("createProgram")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">{t("nextSteps")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p className="mb-2">{t("nextStepsIntro")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add custom application questions specific to this program</li>
              <li>Configure program-specific settings</li>
              <li>Start accepting applications from students</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
