"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus } from "lucide-react";

export function RoleManagement() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetAdmin = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role: "ADMIN" }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setEmail(""); // Clear email on success
      } else {
        setError(data.error || "Failed to set admin role");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <CardTitle>Platform Administrator Management</CardTitle>
        </div>
        <CardDescription>
          Grant platform admin access to trusted users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm mb-4">
          <p className="text-blue-800 font-semibold mb-2">Role Assignment Guide:</p>
          <ul className="text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>ADMIN:</strong> Use this section to grant full platform access</li>
            <li><strong>SCHOOL_ADMIN:</strong> Managed per school via Universities → Team Members</li>
            <li><strong>APPLICANT:</strong> Default role - automatically assigned on signup</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full"
          />
        </div>

        <Button
          onClick={handleSetAdmin}
          disabled={loading || !email}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {loading ? "Granting Admin Access..." : "Make Platform Administrator"}
        </Button>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold">✅ Success!</p>
            <p className="text-sm text-green-700 mt-1">{result.message}</p>
            <p className="text-sm text-green-700 mt-2 font-medium">
              ⚠️ {result.note}
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

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
          <p className="text-amber-800 font-semibold mb-1">⚠️ Important:</p>
          <p className="text-amber-700">
            After granting admin access, the user must sign out and sign back in for changes to take effect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
