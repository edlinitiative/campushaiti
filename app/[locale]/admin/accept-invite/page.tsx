"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Redirect to admin dashboard after 3 seconds
        setTimeout(() => {
          router.push("/admin");
        }, 3000);
      } else {
        setError(data.error || "Failed to accept invitation");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation link is invalid or incomplete.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <CardTitle>Platform Administrator Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join Campus Haiti as an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !error && (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 font-semibold mb-2">What you'll get:</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside text-sm">
                  <li><strong>VIEWER</strong> access to the admin dashboard</li>
                  <li>View all platform data and statistics</li>
                  <li>Monitor platform activity</li>
                  <li>Read-only access (can be upgraded by existing admins)</li>
                </ul>
              </div>

              <Button
                onClick={handleAccept}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting Invitation...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">✅ Success!</p>
                  <p className="text-sm text-green-700 mt-1">{result.message}</p>
                  <p className="text-sm text-green-700 mt-2">
                    Access Level: <strong>{result.role}</strong>
                  </p>
                  {result.note && (
                    <p className="text-xs text-green-600 mt-2">{result.note}</p>
                  )}
                  <p className="text-xs text-green-600 mt-3">
                    Redirecting to admin dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold">❌ Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Make sure you're signed in with the email address that received this invitation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
