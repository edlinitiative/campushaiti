"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewProgramPage() {
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
              Back to Programs
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Program</CardTitle>
            <CardDescription>
              Add a new degree program to your university&apos;s offerings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Degree Type *</Label>
                <Select value={formData.degree} onValueChange={(value) => handleChange("degree", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELOR">Bachelor&apos;s Degree</SelectItem>
                    <SelectItem value="MASTER">Master&apos;s Degree</SelectItem>
                    <SelectItem value="DOCTORATE">Doctorate (PhD)</SelectItem>
                    <SelectItem value="ASSOCIATE">Associate Degree</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="DIPLOMA">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the program, its curriculum, and what students will learn..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown to prospective students
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Admission Requirements *</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the requirements for admission (e.g., high school diploma, minimum GPA, test scores, etc.)"
                  value={formData.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeCents">Application Fee *</Label>
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
                    Amount students will pay to apply
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Last day to accept applications
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Program
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p className="mb-2">After creating your program, you can:</p>
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
