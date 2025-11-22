"use client";

import { useState, useEffect } from "react";
import { auth, storage } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Upload, FileText, Trash2, Eye, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Haiti-specific document requirements - labels will be translated
const getDocumentTypes = (t: any) => [
  { value: "BIRTH_CERTIFICATE", labelKey: "birthCertificate", required: true },
  { value: "BACCALAUREAT", labelKey: "baccCertificate", required: true },
  { value: "TRANSCRIPT", labelKey: "schoolTranscript", required: true },
  { value: "NATIONAL_ID", labelKey: "nationalId", required: false },
  { value: "PASSPORT", labelKey: "passportDoc", required: false },
  { value: "PASSPORT_PHOTO", labelKey: "passportPhoto", required: true },
  { value: "RECOMMENDATION_LETTER", labelKey: "recommendationLetter", required: false },
  { value: "DIPLOMA", labelKey: "otherDiploma", required: false },
  { value: "CV", labelKey: "cvResume", required: false },
];

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG', 
  'image/png': 'PNG',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
};

export default function DocumentsStep({ onNext, onBack }: DocumentsStepProps) {
  const t = useTranslations("apply.documents");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentKind, setDocumentKind] = useState<string>("BIRTH_CERTIFICATE");
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const response = await fetch(`/api/user/documents?userId=${user.uid}`);
      if (!response.ok) {
        console.error("Failed to load documents:", response.statusText);
        return;
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    // Reset errors
    setFileError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      setFileError(t("fileTooLarge", { max: maxMB, size: sizeMB }));
      e.target.value = "";
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      setFileError(t("invalidFileType", { types: Object.values(ALLOWED_TYPES).join(', ') }));
      e.target.value = "";
      return;
    }

    // Set selected file for preview
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFile({
          url: e.target?.result as string,
          name: file.name,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreviewFile({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      });
    }
  };

  const confirmUpload = async () => {
    if (!selectedFile) return;

    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const docId = `${Date.now()}_${selectedFile.name}`;
      const storagePath = `users/${user.uid}/docs/${docId}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setFileError(t("uploadFailed"));
          setUploading(false);
        },
        async () => {
          // Upload complete - get download URL and save metadata
          const downloadURL = await getDownloadURL(storageRef);
          
          // Save document metadata via API
          const response = await fetch("/api/user/documents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ownerUid: user.uid,
              kind: documentKind,
              filename: selectedFile.name,
              mimeType: selectedFile.type,
              sizeBytes: selectedFile.size,
              storagePath,
              downloadURL,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save document metadata");
          }

          await loadDocuments();
          setUploading(false);
          setUploadProgress(0);
          setSelectedFile(null);
          setPreviewFile(null);
          setFileError(null);
          
          // Clear file input
          const fileInput = document.getElementById('file') as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileError(t("uploadError"));
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewFile(null);
    setFileError(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      // Delete via API
      const response = await fetch(`/api/user/documents?documentId=${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      
      // Note: Firebase Storage deletion requires admin SDK or storage rules
      // For now, we'll just remove from database
      
      await loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(t("deleteFailed"));
    }
  };

  const handleReplaceDocument = (docType: string) => {
    setDocumentKind(docType);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  const getDocumentsByType = (type: string) => {
    return documents.filter(doc => doc.kind === type);
  };

  const hasRequiredDocuments = () => {
    const requiredTypes = getDocumentTypes(t).filter(dt => dt.required).map(dt => dt.value);
    return requiredTypes.every(type => getDocumentsByType(type).length > 0);
  };

  const getMissingRequiredDocs = () => {
    const requiredTypes = getDocumentTypes(t).filter(dt => dt.required);
    return requiredTypes.filter(type => getDocumentsByType(type.value).length === 0);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Missing Documents Alert */}
          {!hasRequiredDocuments() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t("missingRequired")}</strong>
                <ul className="list-disc list-inside mt-2">
                  {getMissingRequiredDocs().map(doc => (
                    <li key={doc.value}>{t(doc.labelKey)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* File Error Alert */}
          {fileError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {/* Upload Section */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t("uploadNew")}
            </h3>
            
            <div>
              <Label htmlFor="documentKind">{t("documentType")} *</Label>
              <Select value={documentKind} onValueChange={setDocumentKind} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getDocumentTypes(t).map((docType) => (
                    <SelectItem key={docType.value} value={docType.value}>
                      {t(docType.labelKey)} {docType.required && "*"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getDocumentTypes(t).find(d => d.value === documentKind)?.required 
                  ? t("isRequired") 
                  : t("isOptional")}
              </p>
            </div>

            <div>
              <Label htmlFor="file">{t("chooseFile")}</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("acceptedFormats")}
              </p>
            </div>

            {/* File Preview */}
            {selectedFile && !uploading && (
              <div className="border rounded-lg p-4 bg-background space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{t("preview")}</h4>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {ALLOWED_TYPES[selectedFile.type as keyof typeof ALLOWED_TYPES]}
                    </p>
                  </div>
                </div>
                
                {previewFile && (
                  <div className="mt-2">
                    {previewFile.type.startsWith('image/') ? (
                      <img 
                        src={previewFile.url} 
                        alt="Preview" 
                        className="max-w-full h-auto max-h-64 rounded border"
                      />
                    ) : previewFile.type === 'application/pdf' ? (
                      <div className="bg-muted p-4 rounded text-center">
                        <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">PDF Document</p>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded text-center">
                        <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">Document Ready</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={confirmUpload} className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("uploadDocument")}
                  </Button>
                  <Button onClick={cancelUpload} variant="outline">
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            )}

            {uploading && (
              <div>
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground mt-2">
                  {t("uploading")} {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </div>

        {/* Documents by Category */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("yourDocuments")} ({documents.length})
            </h3>
            <Badge variant={hasRequiredDocuments() ? "default" : "secondary"}>
              {hasRequiredDocuments() ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("allRequiredUploaded")}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {t("missingRequiredShort")}
                </span>
              )}
            </Badge>
          </div>

          {getDocumentTypes(t).map((docType) => {
            const docsOfType = getDocumentsByType(docType.value);
            if (docsOfType.length === 0) return null;

            return (
              <div key={docType.value} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  {docType.required && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {t(docType.labelKey)}
                  {docType.required && <Badge variant="secondary" className="text-xs">{t("requiredBadge")}</Badge>}
                </h4>
                <div className="space-y-2">
                  {docsOfType.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center bg-background p-2 rounded border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt.toDate()).toLocaleDateString()} • {(doc.sizeBytes / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingDoc({ url: doc.downloadURL, name: doc.filename, type: doc.mimeType })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t("view")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReplaceDocument(docType.value)}
                        >
                          {t("replace")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDocument(doc.id, doc.storagePath)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noDocuments")}</p>
              <p className="text-sm">{t("uploadToContinue")}</p>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-sm mb-2">{t("guidelines")}</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• {t("guidelineBirth")}</li>
            <li>• {t("guidelineBacc")}</li>
            <li>• {t("guidelineTranscript")}</li>
            <li>• {t("guidelinePhoto")}</li>
            <li>• {t("guidelineId")}</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            {t("back")}
          </Button>
          <Button 
            onClick={onNext} 
            className="flex-1"
            disabled={!hasRequiredDocuments()}
          >
            {hasRequiredDocuments() ? t("continue") : t("uploadRequiredFirst")}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Document Viewer Dialog */}
    <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{viewingDoc?.name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[75vh]">
          {viewingDoc?.type.startsWith('image/') ? (
            <img 
              src={viewingDoc.url} 
              alt={viewingDoc.name}
              className="max-w-full h-auto"
            />
          ) : viewingDoc?.type === 'application/pdf' ? (
            <iframe
              src={viewingDoc.url}
              className="w-full h-[70vh]"
              title={viewingDoc.name}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                {t("cannotPreview")}
              </p>
              <Button onClick={() => window.open(viewingDoc?.url, '_blank')}>
                {t("downloadFile")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
