"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function FixAccessPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/fix-access");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fixAccess = async () => {
    setFixing(true);
    try {
      const response = await fetch("/api/admin/fix-access", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        setFixed(true);
        alert(data.message + "\n\nUpdates:\n" + data.updates.join("\n") + "\n\n" + data.nextSteps);
        
        // Refresh status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error fixing access:", error);
      alert("Failed to fix access");
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <CardTitle>Admin Access Status</CardTitle>
            </div>
            <CardDescription>
              Check and fix your administrator access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Current User</h3>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div><strong>UID:</strong> {status?.user?.uid}</div>
                <div><strong>Email:</strong> {status?.user?.email}</div>
                <div><strong>Role:</strong> {status?.user?.role}</div>
                <div><strong>Admin Access Level:</strong> {status?.user?.adminAccessLevel || "None"}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Status Checks</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {status?.status?.hasAdminClaim ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Has ADMIN custom claim</span>
                </div>
                <div className="flex items-center gap-2">
                  {status?.status?.hasAdminAccessRecord ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Has adminAccess record</span>
                </div>
                <div className="flex items-center gap-2">
                  {status?.invitation?.hasAccepted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Has accepted invitation</span>
                </div>
              </div>
            </div>

            {status?.status?.needsFix && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 font-semibold">⚠️ Access needs to be fixed</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your invitation was accepted but admin access is not properly configured.
                </p>
              </div>
            )}

            {status?.status?.needsFix ? (
              <Button
                onClick={fixAccess}
                disabled={fixing || fixed}
                className="w-full"
                size="lg"
              >
                {fixing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Fixing Access...
                  </>
                ) : fixed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Fixed! Reloading...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Fix Admin Access
                  </>
                )}
              </Button>
            ) : status?.user?.role !== "ADMIN" && status?.customClaims?.role === "ADMIN" ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 font-semibold">🔄 Session Refresh Needed</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your admin access is configured correctly, but your session needs to be refreshed.
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    await fetch("/api/auth/signout", { method: "POST" });
                    window.location.href = "/auth/signin";
                  }}
                  className="w-full"
                  size="lg"
                >
                  Sign Out and Sign Back In
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">✅ Everything looks good!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your admin access is properly configured.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold">View Raw Data</summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded overflow-auto text-xs">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
