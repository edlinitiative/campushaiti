"use client";

import { useState, useEffect } from "react";
import { auth, storage, db } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Upload, FileText, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Haiti-specific document requirements
const DOCUMENT_TYPES = [
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate (Acte de Naissance)", required: true },
  { value: "BACCALAUREAT", label: "Baccalauréat Certificate", required: true },
  { value: "TRANSCRIPT", label: "School Transcript", required: true },
  { value: "NATIONAL_ID", label: "National ID (CIN)", required: false },
  { value: "PASSPORT", label: "Passport", required: false },
  { value: "PASSPORT_PHOTO", label: "Passport Photo (2x2)", required: true },
  { value: "RECOMMENDATION_LETTER", label: "Recommendation Letter", required: false },
  { value: "DIPLOMA", label: "Other Diploma/Certificate", required: false },
  { value: "CV", label: "CV/Resume", required: false },
];

export default function DocumentsStep({ onNext, onBack }: DocumentsStepProps) {
  const t = useTranslations("apply.documents");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentKind, setDocumentKind] = useState<string>("BIRTH_CERTIFICATE");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, "documents"), where("ownerUid", "==", user.uid));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF, JPG, PNG, or DOC files only");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const docId = `${Date.now()}_${file.name}`;
      const storagePath = `users/${user.uid}/docs/${docId}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed. Please try again.");
          setUploading(false);
        },
        async () => {
          // Upload complete - get download URL and save metadata
          const downloadURL = await getDownloadURL(storageRef);
          
          await addDoc(collection(db, "documents"), {
            ownerUid: user.uid,
            kind: documentKind,
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            storagePath,
            downloadURL,
            createdAt: new Date(),
          });

          await loadDocuments();
          setUploading(false);
          setUploadProgress(0);
          
          // Reset file input
          e.target.value = "";
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during upload");
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "documents", docId));
      
      // Note: Firebase Storage deletion requires admin SDK or storage rules
      // For now, we'll just remove from Firestore
      
      await loadDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const getDocumentsByType = (type: string) => {
    return documents.filter(doc => doc.kind === type);
  };

  const hasRequiredDocuments = () => {
    const requiredTypes = DOCUMENT_TYPES.filter(t => t.required).map(t => t.value);
    return requiredTypes.every(type => getDocumentsByType(type).length > 0);
  };

  const getMissingRequiredDocs = () => {
    const requiredTypes = DOCUMENT_TYPES.filter(t => t.required);
    return requiredTypes.filter(type => getDocumentsByType(type.value).length === 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload all required documents for your application. Documents marked with * are mandatory for Haitian universities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Missing Documents Alert */}
        {!hasRequiredDocuments() && (
          <Alert>
            <AlertDescription>
              <strong>Missing Required Documents:</strong>
              <ul className="list-disc list-inside mt-2">
                {getMissingRequiredDocs().map(doc => (
                  <li key={doc.value}>{doc.label}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Document
          </h3>
          
          <div>
            <Label htmlFor="documentKind">Document Type *</Label>
            <Select value={documentKind} onValueChange={setDocumentKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label} {docType.required && "*"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {DOCUMENT_TYPES.find(d => d.value === documentKind)?.required 
                ? "This document is required" 
                : "This document is optional"}
            </p>
          </div>

          <div>
            <Label htmlFor="file">Choose File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Accepted formats: PDF, JPG, PNG, DOC. Max size: 10MB
            </p>
          </div>

          {uploading && (
            <div>
              <Progress value={uploadProgress} />
              <p className="text-sm text-muted-foreground mt-2">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>

        {/* Documents by Category */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Documents ({documents.length})
            </h3>
            <Badge variant={hasRequiredDocuments() ? "default" : "secondary"}>
              {hasRequiredDocuments() ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All Required Uploaded
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Missing Required
                </span>
              )}
            </Badge>
          </div>

          {DOCUMENT_TYPES.map((docType) => {
            const docsOfType = getDocumentsByType(docType.value);
            if (docsOfType.length === 0) return null;

            return (
              <div key={docType.value} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  {docType.required && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {docType.label}
                  {docType.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
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
                        {doc.downloadURL && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.downloadURL, '_blank')}
                          >
                            View
                          </Button>
                        )}
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
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your required documents to continue</p>
            </div>
          )}
        </div>

        {/* Important Information */}
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-sm mb-2">Important Document Guidelines:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Birth Certificate:</strong> Must be official copy with seal (Acte de Naissance)</li>
            <li>• <strong>Baccalauréat:</strong> Original certificate or certified copy required</li>
            <li>• <strong>Transcripts:</strong> Official school records from last institution</li>
            <li>• <strong>Passport Photo:</strong> Recent 2x2 color photo on white background</li>
            <li>• <strong>ID Documents:</strong> National ID (CIN) or valid passport</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            onClick={onNext} 
            className="flex-1"
            disabled={!hasRequiredDocuments()}
          >
            {hasRequiredDocuments() ? "Continue" : "Upload Required Documents First"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
