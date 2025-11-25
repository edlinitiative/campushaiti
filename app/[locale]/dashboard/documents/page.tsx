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

  const t = await getTranslations("userDashboard.documentsPage");
  const tDash = await getTranslations("userDashboard");
  const db = getAdminDb();

  // Fetch documents
  let documents: any[] = [];
  
  try {
    const docsSnapshot = await db.collection("documents")
      .where("ownerUid", "==", user.uid)
      .get();
    
    documents = docsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort by uploadedAt or createdAt if available
    documents.sort((a, b) => {
      const aTime = a.uploadedAt || a.createdAt || 0;
      const bTime = b.uploadedAt || b.createdAt || 0;
      return bTime - aTime; // Newest first
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }

  const getDocTypeIcon = (kind: string) => {
    return FileText;
  };

  const getDocTypeName = (kind: string) => {
    const typeMap: Record<string, string> = {
      'BIRTH_CERTIFICATE': 'Birth Certificate',
      'BACCALAUREAT': 'Baccalauréat',
      'TRANSCRIPT': 'Transcript',
      'PASSPORT_PHOTO': 'Passport Photo',
      'NATIONAL_ID': 'National ID',
      'RECOMMENDATION_LETTER': 'Recommendation Letter',
    };
    return typeMap[kind] || kind;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload New Document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('uploadNew')}
            </CardTitle>
            <CardDescription>
              {t('uploadNewDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                {t('clickToUpload')}
              </p>
              <p className="text-xs text-gray-500">
                {t('fileFormats')}
              </p>
            </div>
            <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t('uploadComingSoon')}
            </p>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('yourDocuments', { count: documents.length })}
            </CardTitle>
            <CardDescription>
              {t('manageDocuments')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">{t('noDocumentsYet')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('uploadFirst')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const Icon = getDocTypeIcon(doc.kind);
                  const uploadTime = doc.uploadedAt || doc.createdAt;
                  const uploadDate = uploadTime ? new Date(uploadTime) : null;
                  const isValidDate = uploadDate && !isNaN(uploadDate.getTime());
                  
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
                          <h4 className="font-semibold">{doc.name || doc.fileName || getDocTypeName(doc.kind)}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{getDocTypeName(doc.kind)}</span>
                            {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                            {isValidDate && (
                              <span>
                                {uploadDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {doc.verified && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t('verified')}
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
            <CardTitle>{t('requiredDocsTitle')}</CardTitle>
            <CardDescription>
              {t('requiredDocsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: t('highSchoolTranscript'), kind: 'TRANSCRIPT', required: true },
                { name: tDash('birthCertificate'), kind: 'BIRTH_CERTIFICATE', required: true },
                { name: t('nationalId'), kind: 'NATIONAL_ID', required: true },
                { name: tDash('passportPhoto'), kind: 'PASSPORT_PHOTO', required: true },
                { name: t('recommendationLetter'), kind: 'RECOMMENDATION_LETTER', required: false },
              ].map((docType) => {
                const uploaded = documents.some(d => d.kind === docType.kind);
                return (
                  <div
                    key={docType.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {uploaded ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{docType.name}</p>
                        {docType.required && (
                          <p className="text-xs text-red-600">{t('required')}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      {uploaded ? (
                        <span className="text-green-600 font-medium">✓ Uploaded</span>
                      ) : (
                        <span className="text-muted-foreground">{t('notUploaded')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
