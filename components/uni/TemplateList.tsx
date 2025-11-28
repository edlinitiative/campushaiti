/**
 * Template List Component
 * Display and manage message templates
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy, Mail } from "lucide-react";
import Link from "next/link";
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

interface TemplateListProps {
  templates: any[];
  universityId: string;
}

const TYPE_LABELS: Record<string, string> = {
  missing_documents: "Missing Documents",
  interview_invitation: "Interview Invitation",
  acceptance_letter: "Acceptance Letter",
  rejection_notice: "Rejection Notice",
  general: "General",
};

const TYPE_COLORS: Record<string, string> = {
  missing_documents: "bg-orange-100 text-orange-800",
  interview_invitation: "bg-purple-100 text-purple-800",
  acceptance_letter: "bg-green-100 text-green-800",
  rejection_notice: "bg-red-100 text-red-800",
  general: "bg-blue-100 text-blue-800",
};

export function TemplateList({ templates, universityId }: TemplateListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/uni/templates/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/uni/templates/${templateId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to duplicate template");
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
      alert("Failed to duplicate template");
    }
  };

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No templates yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first message template to streamline communications
            </p>
            <Link href="/schools/dashboard/templates/new">
              <Button>Create Template</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by type
  const grouped = templates.reduce((acc, template) => {
    const type = template.type || "general";
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([type, typeTemplates]) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={TYPE_COLORS[type] || TYPE_COLORS.general}>
                {TYPE_LABELS[type] || type}
              </Badge>
              <span className="text-sm text-gray-500">
                {typeTemplates.length} template{typeTemplates.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {typeTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.subject}
                        </CardDescription>
                      </div>
                      {template.isDefault && (
                        <Badge variant="outline" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {template.variables?.length || 0} variable
                        {template.variables?.length !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link href={`/schools/dashboard/templates/${template.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
