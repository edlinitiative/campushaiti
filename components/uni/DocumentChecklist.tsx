/**
 * Document Checklist Component
 * Manage application documents with status tracking
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, X, ExternalLink } from "lucide-react";
import { DocumentStatus } from "@/lib/types/uni";

interface DocumentChecklistProps {
  applicationId: string;
  documents: any[];
}

const STATUS_COLORS: Record<DocumentStatus, string> = {
  required: "bg-gray-100 text-gray-800",
  received: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function DocumentChecklist({
  applicationId,
  documents = [],
}: DocumentChecklistProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (docId: string, status: DocumentStatus) => {
    setUpdating(docId);
    try {
      const response = await fetch(
        `/api/uni/applications/${applicationId}/documents/${docId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document status");
    } finally {
      setUpdating(null);
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{doc.name || doc.type}</h4>
                    <Badge className={STATUS_COLORS[doc.status as DocumentStatus]}>
                      {doc.status}
                    </Badge>
                    {doc.required && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  {doc.uploadedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Uploaded{" "}
                      {doc.uploadedAt.toDate
                        ? doc.uploadedAt.toDate().toLocaleDateString()
                        : "recently"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {doc.status !== "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(doc.id, "approved")}
                    disabled={updating === doc.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {doc.status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(doc.id, "rejected")}
                    disabled={updating === doc.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
