/**
 * Template Editor Component
 * Form for creating/editing message templates
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageTemplateType } from "@/lib/types/uni";
import { extractVariables, getDefaultTemplate, previewTemplate } from "@/lib/utils/template-parser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Save } from "lucide-react";

interface TemplateEditorProps {
  template: any | null;
  universityId: string;
}

const TEMPLATE_TYPES: { value: MessageTemplateType; label: string }[] = [
  { value: "missing_documents", label: "Missing Documents" },
  { value: "interview_invitation", label: "Interview Invitation" },
  { value: "acceptance_letter", label: "Acceptance Letter" },
  { value: "rejection_notice", label: "Rejection Notice" },
  { value: "general", label: "General" },
];

export function TemplateEditor({ template, universityId }: TemplateEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: (template?.type as MessageTemplateType) || "general",
    name: template?.name || "",
    subject: template?.subject || "",
    body: template?.body || "",
  });

  const detectedVariables = extractVariables(formData.subject + " " + formData.body);

  const handleTypeChange = (type: MessageTemplateType) => {
    if (!template && (!formData.subject || !formData.body)) {
      // Load default template for new templates
      const defaultTemplate = getDefaultTemplate(type);
      setFormData({
        type,
        name: formData.name || `Default ${TEMPLATE_TYPES.find((t) => t.value === type)?.label}`,
        subject: defaultTemplate.subject,
        body: defaultTemplate.body,
      });
    } else {
      setFormData({ ...formData, type });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const url = template
        ? `/api/uni/templates/${template.id}`
        : `/api/uni/templates`;

      const response = await fetch(url, {
        method: template ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          universityId,
          variables: detectedVariables,
        }),
      });

      if (response.ok) {
        router.push("/schools/dashboard/templates");
      } else {
        alert("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const preview = previewTemplate(formData.subject + "\n\n" + formData.body);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Basic information about this template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Standard Acceptance Letter"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Congratulations - Accepted to {{programName}}"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              placeholder="Enter your message here. Use {{variableName}} for dynamic content."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Detected Variables</Label>
            <div className="flex flex-wrap gap-2">
              {detectedVariables.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No variables detected. Use {"{{"} and {"}}"}  to add variables.
                </p>
              ) : (
                detectedVariables.map((variable) => (
                  <Badge key={variable} variant="outline">
                    {variable}
                  </Badge>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Available: studentName, studentEmail, programName, universityName,
              reviewerName, deadline, interviewDate, interviewTime, interviewLocation,
              missingDocuments
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Preview with sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-500 mb-1">Subject:</p>
              <p className="font-semibold">{preview.split("\n\n")[0]}</p>
            </div>
            <div className="whitespace-pre-wrap text-sm">
              {preview.split("\n\n").slice(1).join("\n\n")}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/schools/dashboard/templates")}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </div>
  );
}
