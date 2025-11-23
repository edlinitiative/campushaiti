"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Mail, Clock, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";

interface AdminAccess {
  uid: string;
  email: string;
  name: string;
  role: "VIEWER" | "ADMIN";
  grantedAt: number;
  grantedBy: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  invitedByName: string;
  createdAt: number;
  expiresAt: number;
}

export function RoleManagement() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminAccess[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [upgradingUid, setUpgradingUid] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
    loadInvitations();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/access");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error("Error loading admins:", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await fetch("/api/admin/invite");
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (err) {
      console.error("Error loading invitations:", err);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setEmail("");
        loadInvitations(); // Refresh invitations list
      } else {
        setError(data.error || "Failed to send invitation");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeAccess = async (uid: string, newRole: "VIEWER" | "ADMIN") => {
    setUpgradingUid(uid);
    try {
      const response = await fetch("/api/admin/access", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, role: newRole }),
      });

      if (response.ok) {
        loadAdmins(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update access");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setUpgradingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            <CardTitle>Invite Administrator</CardTitle>
          </div>
          <CardDescription>
            Send an invitation to grant platform admin access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm mb-4">
            <p className="text-blue-800 font-semibold mb-2">🔒 Security Protocol:</p>
            <ul className="text-blue-700 space-y-1 list-disc list-inside">
              <li>Invitations are sent via email and must be accepted</li>
              <li>New admins start with <strong>VIEWER</strong> access (read-only)</li>
              <li>Existing admins can upgrade access to full <strong>ADMIN</strong> if needed</li>
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
            onClick={handleInvite}
            disabled={loading || !email}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            {loading ? "Sending Invitation..." : "Send Admin Invitation"}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-semibold">✅ Invitation Sent!</p>
              <p className="text-sm text-green-700 mt-1">{result.message}</p>
              <p className="text-xs text-green-600 mt-2">
                They will receive an email with instructions to accept.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-semibold">❌ Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <CardTitle>Pending Invitations</CardTitle>
            </div>
            <CardDescription>
              Waiting for acceptance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md"
                >
                  <div>
                    <p className="font-medium text-sm">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited by {invite.invitedByName} •{" "}
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Administrators */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <CardTitle>Current Administrators</CardTitle>
          </div>
          <CardDescription>
            Manage access levels for existing admins
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No administrators yet</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.uid}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="font-medium text-sm">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(admin.grantedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={admin.role === "ADMIN" ? "default" : "outline"}
                      className={admin.role === "ADMIN" ? "bg-green-600" : "bg-blue-100"}
                    >
                      {admin.role}
                    </Badge>
                    {admin.role === "VIEWER" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpgradeAccess(admin.uid, "ADMIN")}
                        disabled={upgradingUid === admin.uid}
                      >
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Upgrade to Admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpgradeAccess(admin.uid, "VIEWER")}
                        disabled={upgradingUid === admin.uid}
                      >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Downgrade to Viewer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
