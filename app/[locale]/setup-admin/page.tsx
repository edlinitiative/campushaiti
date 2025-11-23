"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("info@dlight.org");
  const [role, setRole] = useState("ADMIN");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetRole = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to set role");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Admin Role</CardTitle>
          <CardDescription>
            Set user roles for initial platform setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
              <option value="APPLICANT">APPLICANT</option>
            </select>
          </div>

          <Button
            onClick={handleSetRole}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Setting Role..." : "Set Role"}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-semibold">✅ Success!</p>
              <p className="text-sm text-green-700 mt-1">{result.message}</p>
              <p className="text-sm text-green-700 mt-2 font-medium">
                {result.note}
              </p>
              <p className="text-xs text-green-600 mt-2">
                User ID: {result.userId}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold">❌ Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm">
            <p className="text-amber-800 font-semibold mb-2">⚠️ Important:</p>
            <ul className="text-amber-700 space-y-1 list-disc list-inside">
              <li>After setting role, user must sign out and sign back in</li>
              <li>This page should be removed after initial setup</li>
              <li>Currently unprotected - anyone can access</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
