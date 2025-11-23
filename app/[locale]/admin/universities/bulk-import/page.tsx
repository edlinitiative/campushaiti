"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export default function BulkImportPage() {
  const t = useTranslations("admin");
  const [csvData, setCsvData] = useState("");
  const [sendEmails, setSendEmails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const universities = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const uni: any = {};

      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, "_");
        uni[key] = values[index] || "";
      });

      return {
        name: uni.name || uni.university_name,
        slug: uni.slug,
        city: uni.city,
        country: uni.country || "Haiti",
        email: uni.email || uni.contact_email,
        phone: uni.phone,
        website: uni.website || uni.website_url,
        description: uni.description,
        contactPersonName: uni.contact_person_name || uni.contact_name,
        contactPersonEmail: uni.contact_person_email || uni.contact_email,
      };
    });

    return universities.filter((u) => u.name && u.city && u.email);
  };

  const handleImport = async () => {
    if (!csvData) {
      alert("Please upload or paste CSV data");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const universities = parseCSV(csvData);

      if (universities.length === 0) {
        alert("No valid universities found in CSV");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/universities/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universities, sendEmails }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        alert(data.error || "Failed to import universities");
      }
    } catch (error) {
      console.error("Error importing:", error);
      alert("Failed to import universities");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,city,country,email,phone,website,description,contact_person_name,contact_person_email
Université d'État d'Haïti,Port-au-Prince,Haiti,info@ueh.edu.ht,+509 1234 5678,https://ueh.edu.ht,Premier université publique,Dr. Jean Dupont,jean.dupont@ueh.edu.ht
Université Quisqueya,Port-au-Prince,Haiti,admissions@uniq.edu.ht,+509 2222 3333,https://uniq.edu.ht,Private university,Dr. Marie Laurent,marie.laurent@uniq.edu.ht`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "universities_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Import Universities</h1>
        <p className="text-muted-foreground">
          Import multiple universities at once from CSV file
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              CSV Format
            </CardTitle>
            <CardDescription>Required columns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Required:</span>
                <ul className="list-disc list-inside ml-2 text-muted-foreground">
                  <li>name</li>
                  <li>city</li>
                  <li>country</li>
                  <li>email</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold">Optional:</span>
                <ul className="list-disc list-inside ml-2 text-muted-foreground">
                  <li>slug (auto-generated if not provided)</li>
                  <li>phone</li>
                  <li>website</li>
                  <li>description</li>
                  <li>contact_person_name</li>
                  <li>contact_person_email</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Template</CardTitle>
            <CardDescription>Start with a sample CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              The template includes example universities. Replace them with your data.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload or Paste CSV Data</CardTitle>
          <CardDescription>Upload a file or paste CSV content directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Upload CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-2"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste CSV</span>
            </div>
          </div>

          <div>
            <Label htmlFor="csv">CSV Data</Label>
            <Textarea
              id="csv"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="name,city,country,email..."
              rows={10}
              className="font-mono text-sm mt-2"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendEmails"
              checked={sendEmails}
              onCheckedChange={(checked) => setSendEmails(!!checked)}
            />
            <label
              htmlFor="sendEmails"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send welcome emails with login credentials
            </label>
          </div>

          <Button onClick={handleImport} disabled={loading || !csvData} className="w-full" size="lg">
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Importing..." : "Import Universities"}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
            <CardDescription>
              Imported: {results.imported} | Failed: {results.failed}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.results.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Imported ({results.results.length})
                </h3>
                <div className="space-y-2">
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                      <div className="font-medium">{result.university}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Slug: {result.slug} | Admin Created: {result.adminCreated ? "Yes" : "No"} | 
                        Email Sent: {result.emailSent ? "Yes" : "No"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed ({results.errors.length})
                </h3>
                <div className="space-y-2">
                  {results.errors.map((error: any, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        <strong>{error.university}:</strong> {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Input({ type, accept, onChange, className, id }: any) {
  return (
    <input
      type={type}
      accept={accept}
      onChange={onChange}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      id={id}
    />
  );
}
