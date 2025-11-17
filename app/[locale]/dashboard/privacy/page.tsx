"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Download, Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    deleteApplications: false,
    deleteDocuments: false,
    anonymizeAuditLogs: true,
  });

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gdpr", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create downloadable JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `my-data-${Date.now()}.json`;
        a.click();
        
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 5000);
      } else {
        alert("Failed to export data. Please try again.");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("An error occurred while exporting data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gdpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteOptions),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Data deletion completed!\n\nDeleted: ${data.deleted.join(", ")}\nRetained: ${data.retained.join(", ")}`
        );
        setShowDeleteDialog(false);
        
        // Redirect to logout or home
        window.location.href = "/auth/signout";
      } else {
        alert("Failed to delete data. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("An error occurred while deleting data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Privacy & Data Control
        </h1>
        <p className="text-muted-foreground">
          Manage your personal data and privacy settings
        </p>
      </div>

      {showExportSuccess && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Your data has been exported successfully and downloaded to your device.
          </AlertDescription>
        </Alert>
      )}

      {/* GDPR Rights Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
          <CardDescription>
            Under GDPR and privacy regulations, you have the following rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Right to Access</p>
                <p className="text-sm text-muted-foreground">
                  You can request a copy of all personal data we hold about you.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Right to Erasure</p>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your personal data, subject to legal requirements.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Right to Portability</p>
                <p className="text-sm text-muted-foreground">
                  You can receive your data in a machine-readable format.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a complete copy of your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will include your profile information, applications, documents metadata,
            payment history, and activity logs. The data will be provided in JSON format.
          </p>
          <Button onClick={handleExportData} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Exporting..." : "Export My Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete My Account
          </CardTitle>
          <CardDescription>
            Permanently remove your account and associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. Some data may be retained
              for legal and compliance purposes.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mb-4">
            When you delete your account, you can choose what happens to your data:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mb-4 ml-4">
            <li>• Your profile will be permanently deleted</li>
            <li>• Applications may be deleted or anonymized based on your choice</li>
            <li>• Documents can be permanently removed</li>
            <li>• Audit logs will be anonymized for security purposes</li>
          </ul>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              This is a permanent action. Please review your options carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>This action cannot be undone.</strong> Your account will be permanently deleted.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-applications"
                  checked={deleteOptions.deleteApplications}
                  onCheckedChange={(checked) =>
                    setDeleteOptions({ ...deleteOptions, deleteApplications: checked as boolean })
                  }
                />
                <Label htmlFor="delete-applications" className="text-sm font-normal">
                  Delete all my applications (otherwise they will be anonymized)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-documents"
                  checked={deleteOptions.deleteDocuments}
                  onCheckedChange={(checked) =>
                    setDeleteOptions({ ...deleteOptions, deleteDocuments: checked as boolean })
                  }
                />
                <Label htmlFor="delete-documents" className="text-sm font-normal">
                  Delete all my uploaded documents
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymize-logs"
                  checked={deleteOptions.anonymizeAuditLogs}
                  onCheckedChange={(checked) =>
                    setDeleteOptions({ ...deleteOptions, anonymizeAuditLogs: checked as boolean })
                  }
                  disabled
                />
                <Label htmlFor="anonymize-logs" className="text-sm font-normal text-muted-foreground">
                  Anonymize audit logs (required for compliance)
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteData}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Permanently Delete My Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
