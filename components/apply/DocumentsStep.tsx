"use client";

import { useState, useEffect } from "react";
import { auth, storage, db } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DocumentsStep({ onNext, onBack }: DocumentsStepProps) {
  const t = useTranslations("apply.documents");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentKind, setDocumentKind] = useState<string>("TRANSCRIPT");

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
          alert("Upload failed");
          setUploading(false);
        },
        async () => {
          // Upload complete - save metadata to Firestore
          await addDoc(collection(db, "documents"), {
            ownerUid: user.uid,
            kind: documentKind,
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            storagePath,
            createdAt: new Date(),
          });

          await loadDocuments();
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>Upload required documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="documentKind">Document Type</Label>
            <Select value={documentKind} onValueChange={setDocumentKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                <SelectItem value="DIPLOMA">Diploma</SelectItem>
                <SelectItem value="ID_CARD">ID Card</SelectItem>
                <SelectItem value="PASSPORT">Passport</SelectItem>
                <SelectItem value="RECOMMENDATION_LETTER">Recommendation Letter</SelectItem>
                <SelectItem value="CV">CV/Resume</SelectItem>
              </SelectContent>
            </Select>
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

        <div className="space-y-2">
          <h3 className="font-semibold">Uploaded Documents ({documents.length})</h3>
          {documents.map((doc) => (
            <div key={doc.id} className="flex justify-between items-center border p-2 rounded">
              <div>
                <p className="font-medium">{doc.filename}</p>
                <p className="text-sm text-muted-foreground">{doc.kind}</p>
              </div>
              <Badge>{(doc.sizeBytes / 1024).toFixed(0)} KB</Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext} className="flex-1">Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
