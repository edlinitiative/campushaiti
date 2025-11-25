"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Mail, Clock, CheckCircle, ChevronUp, ChevronDown, RefreshCw, Trash2, Copy, Check } from "lucide-react";

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
  token: string;
}

export function RoleManagement() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null);
  const [copiedNew, setCopiedNew] = useState(false);
  const [admins, setAdmins] = useState<AdminAccess[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [upgradingUid, setUpgradingUid] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAdminUid, setDeletingAdminUid] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentUserAccess, setCurrentUserAccess] = useState<{ role: string; uid: string } | null>(null);

  useEffect(() => {
    loadAdmins();
    loadInvitations();
    loadCurrentUserAccess();
  }, []);

  const loadCurrentUserAccess = async () => {
    try {
      const response = await fetch("/api/admin/access/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserAccess(data);
      }
    } catch (err) {
      console.error("Error loading current user access:", err);
    }
  };

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
    setNewInviteUrl(null);
    setCopiedNew(false);

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
        setNewInviteUrl(data.inviteUrl);
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

  const handleCopyNewInviteLink = () => {
    if (newInviteUrl) {
      navigator.clipboard.writeText(newInviteUrl).then(() => {
        setCopiedNew(true);
        setTimeout(() => setCopiedNew(false), 2000);
      }).catch(() => {
        alert("Failed to copy link. Please copy manually:\n\n" + newInviteUrl);
      });
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

  const handleResendInvitation = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      const response = await fetch("/api/admin/invite/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Invitation resent successfully!");
      } else {
        alert(data.error || "Failed to resend invitation");
      }
    } catch (err) {
      alert("An error occurred while resending invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    setDeletingId(invitationId);
    try {
      const response = await fetch(`/api/admin/invite?id=${invitationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadInvitations(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel invitation");
      }
    } catch (err) {
      alert("An error occurred while cancelling invitation");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyInviteLink = (token: string, invitationId: string) => {
    const inviteUrl = `${window.location.origin}/admin/accept-invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedId(invitationId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      alert("Failed to copy link. Please copy manually:\n\n" + inviteUrl);
    });
  };

  const handleDeleteAdmin = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${email}?\n\nThis will revoke their admin role and remove them from the admin access list.`)) {
      return;
    }

    setDeletingAdminUid(uid);
    try {
      const response = await fetch(`/api/admin/access/${uid}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Admin access removed successfully");
        loadAdmins(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to remove admin");
      }
    } catch (err) {
      alert("An error occurred while removing admin");
    } finally {
      setDeletingAdminUid(null);
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
            <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
              <div>
                <p className="text-green-800 font-semibold">✅ Invitation Created!</p>
                <p className="text-sm text-green-700 mt-1">{result.message}</p>
                {!result.emailSent && (
                  <p className="text-sm text-amber-700 mt-1">
                    ⚠️ Email could not be sent. Please share the link below manually.
                  </p>
                )}
              </div>
              
              {newInviteUrl && (
                <div className="bg-white border border-green-300 rounded p-3">
                  <p className="text-xs font-medium text-green-900 mb-2">Invitation Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-50 p-2 rounded border break-all">
                      {newInviteUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyNewInviteLink}
                    >
                      {copiedNew ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    💡 Share this link via email, WhatsApp, Slack, or any messaging app
                  </p>
                </div>
              )}
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
              {invitations.map((invite) => {
                const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/accept-invite?token=${invite.token}`;
                const isExpired = invite.expiresAt < Date.now();
                
                return (
                  <div
                    key={invite.id}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited by {invite.invitedByName} •{" "}
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                        {isExpired && (
                          <p className="text-xs text-red-600 font-medium mt-1">
                            ⚠️ Expired - Create a new invitation
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-100">
                          Pending
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invite.id)}
                          disabled={resendingId === invite.id || isExpired}
                          title="Resend invitation email"
                        >
                          <RefreshCw className={`w-4 h-4 ${resendingId === invite.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelInvitation(invite.id)}
                          disabled={deletingId === invite.id}
                          title="Cancel invitation"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Invitation Link */}
                    <div className="bg-white border border-amber-300 rounded p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-amber-900 mb-1">Invitation Link:</p>
                          <p className="text-xs font-mono text-gray-600 truncate">{inviteUrl}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyInviteLink(invite.token, invite.id)}
                          disabled={isExpired}
                          title="Copy invitation link"
                          className="flex-shrink-0"
                        >
                          {copiedId === invite.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        💡 Share this link directly with {invite.email} via your preferred method (email, WhatsApp, Slack, etc.)
                      </p>
                    </div>
                  </div>
                );
              })}
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
              {admins.map((admin) => {
                const isSuperAdmin = currentUserAccess?.role === "ADMIN";
                const isCurrentUser = currentUserAccess?.uid === admin.uid;
                const canDelete = isSuperAdmin && !isCurrentUser;
                
                return (
                  <div
                    key={admin.uid}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {admin.email}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                      </p>
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
                      {isSuperAdmin && (
                        <>
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
                          ) : !isCurrentUser && (
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
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAdmin(admin.uid, admin.email)}
                              disabled={deletingAdminUid === admin.uid}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
