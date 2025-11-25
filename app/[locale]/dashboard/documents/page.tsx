import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { FileText, Upload, Download, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    const signinPath = locale === "en" ? "/auth/signin" : `/${locale}/auth/signin`;
    redirect(signinPath);
  }

  const t = await getTranslations("userDashboard");
  const db = getAdminDb();

  // Fetch documents
  let documents: any[] = [];
  
  try {
    const docsSnapshot = await db.collection("documents")
      .where("ownerUid", "==", user.uid)
      .orderBy("uploadedAt", "desc")
      .get();
    
    documents = docsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching documents:", error);
  }

  const getDocTypeIcon = (type: string) => {
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Documents</h1>
        <p className="text-muted-foreground">
          Manage your uploaded documents and certificates
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload New Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Document
            </CardTitle>
            <CardDescription>
              Upload transcripts, certificates, or other required documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG up to 10MB
              </p>
            </div>
            <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Document upload functionality coming soon
            </p>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Documents ({documents.length})
            </CardTitle>
            <CardDescription>
              View and manage all your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const Icon = getDocTypeIcon(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{doc.name || doc.fileName}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{doc.type}</span>
                            {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                            <span>
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {doc.verified && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Required Documents Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Make sure you have all required documents for your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "High School Transcript", required: true },
                { name: "Birth Certificate", required: true },
                { name: "National ID", required: true },
                { name: "Passport Photo", required: true },
                { name: "Recommendation Letter", required: false },
              ].map((docType) => (
                <div
                  key={docType.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 rounded">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{docType.name}</p>
                      {docType.required && (
                        <p className="text-xs text-red-600">Required</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Not uploaded
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
