"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Loader2, LogIn } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, type User } from "firebase/auth";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if user is signed in, if not show sign in prompt
  useEffect(() => {
    if (!authLoading && !user && token) {
      // Store the invitation token in sessionStorage so we can retrieve it after sign in
      sessionStorage.setItem("pendingInviteToken", token);
    }
  }, [authLoading, user, token]);

  // Auto-accept if user just signed in with pending token
  useEffect(() => {
    const pendingToken = sessionStorage.getItem("pendingInviteToken");
    if (!authLoading && user && pendingToken && pendingToken === token) {
      sessionStorage.removeItem("pendingInviteToken");
      // Small delay to ensure session is fully established
      setTimeout(() => {
        handleAccept();
      }, 1000);
    }
  }, [authLoading, user, token]);

  const handleSignIn = () => {
    // Redirect to sign in page with return URL
    const returnUrl = encodeURIComponent(`/admin/accept-invite?token=${token}`);
    router.push(`/auth/signin?returnUrl=${returnUrl}`);
  };

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
          {authLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : !user ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 font-semibold mb-2">Sign in to accept this invitation</p>
                <p className="text-sm text-blue-700">
                  You need to be signed in with your email account to accept this administrator invitation.
                </p>
              </div>

              <Button
                onClick={handleSignIn}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Accept Invitation
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Make sure to sign in with the email address that received this invitation.
              </p>
            </>
          ) : !result && !error ? (
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
          ) : null}

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
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">❌ Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  
                  {error.includes("must be signed in") && (
                    <Button
                      onClick={handleSignIn}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!authLoading && user && !result && !error && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Signed in as <strong>{user.email}</strong>
              </p>
            </div>
          )}
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
