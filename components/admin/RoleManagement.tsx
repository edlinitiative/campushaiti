"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function RoleManagement() {
  const [email, setEmail] = useState("");
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
        setEmail(""); // Clear email on success
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <CardTitle>User Role Management</CardTitle>
        </div>
        <CardDescription>
          Set or update user roles (ADMIN, SCHOOL_ADMIN, APPLICANT)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ADMIN">ADMIN - Full platform access</option>
              <option value="SCHOOL_ADMIN">SCHOOL_ADMIN - School management</option>
              <option value="APPLICANT">APPLICANT - Student access</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleSetRole}
          disabled={loading || !email}
          className="w-full"
        >
          {loading ? "Setting Role..." : "Set User Role"}
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

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <p className="text-blue-800 font-semibold mb-1">ℹ️ Note:</p>
          <p className="text-blue-700">
            After setting a role, the user must sign out and sign back in for changes to take effect.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
