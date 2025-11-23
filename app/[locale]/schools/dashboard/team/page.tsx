"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Shield, Mail, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";

type UserRole = "ADMIN" | "REVIEWER" | "VIEWER";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  invitedAt: string;
  lastActive?: string;
}

const rolePermissions = {
  ADMIN: {
    canManageUsers: true,
    canManagePrograms: true,
    canReviewApplications: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteApplications: true,
  },
  REVIEWER: {
    canManageUsers: false,
    canManagePrograms: false,
    canReviewApplications: true,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteApplications: false,
  },
  VIEWER: {
    canManageUsers: false,
    canManagePrograms: false,
    canReviewApplications: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteApplications: false,
  },
};

export default function TeamManagementPage() {
  const t = useTranslations("schools.team");
  const [demoMode] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "REVIEWER" as UserRole,
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@university.edu",
      role: "ADMIN",
      status: "ACTIVE",
      invitedAt: "2024-01-15",
      lastActive: "2024-03-10",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      role: "REVIEWER",
      status: "ACTIVE",
      invitedAt: "2024-02-01",
      lastActive: "2024-03-09",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@university.edu",
      role: "VIEWER",
      status: "PENDING",
      invitedAt: "2024-03-05",
    },
  ]);

  const handleInviteUser = () => {
    if (!inviteForm.name || !inviteForm.email) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "PENDING",
      invitedAt: new Date().toISOString().split('T')[0],
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteForm({ name: "", email: "", role: "REVIEWER" });
    setShowInviteDialog(false);
  };

  const handleUpdateRole = (memberId: string, newRole: UserRole) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    setShowEditDialog(false);
    setEditingMember(null);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm(t("confirmRemove"))) {
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "REVIEWER":
        return "bg-blue-100 text-blue-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("statusActive")}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Mail className="w-3 h-3 mr-1" />
            {t("statusPending")}
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t("statusInactive")}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {demoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800 mb-2">
                {t("demoModeMessage")}{' '}
                <Link href="/auth/signin" className="underline font-medium">{t("signIn")}</Link>
                {' '}{t("or")}{' '}
                <Link href="/schools/register" className="underline font-medium">{t("registerInstitution")}</Link>
                {' '}{t("toManageTeam")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">{t("backToDashboard")}</Link>
          </Button>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                {t("inviteUser")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inviteNewMember")}</DialogTitle>
                <DialogDescription>{t("inviteDescription")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input
                    id="name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder={t("fullNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("emailAddress")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t("role")}</Label>
                  <Select value={inviteForm.role} onValueChange={(value: UserRole) => setInviteForm({ ...inviteForm, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                      <SelectItem value="REVIEWER">{t("roleReviewer")}</SelectItem>
                      <SelectItem value="VIEWER">{t("roleViewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleInviteUser} disabled={!inviteForm.name || !inviteForm.email}>
                  {t("sendInvitation")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-purple-600" />
              {t("roleAdmin")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permManageUsers")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permManagePrograms")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permReviewApplications")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permViewAnalytics")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permManageSettings")}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              {t("roleReviewer")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManageUsers")}
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManagePrograms")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permReviewApplications")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permViewAnalytics")}
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManageSettings")}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-gray-600" />
              {t("roleViewer")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManageUsers")}
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManagePrograms")}
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permReviewApplications")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {t("permViewAnalytics")}
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                {t("permManageSettings")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("teamMembers")}</CardTitle>
          <CardDescription>
            {teamMembers.length} {t("membersCount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("lastActive")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {t(`role${member.role.charAt(0) + member.role.slice(1).toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.lastActive
                      ? new Date(member.lastActive).toLocaleDateString()
                      : t("neverActive")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMember(member);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editMemberRole")}</DialogTitle>
            <DialogDescription>
              {t("editRoleDescription")} {editingMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t("role")}</Label>
              <Select
                value={editingMember?.role}
                onValueChange={(value: UserRole) =>
                  editingMember && handleUpdateRole(editingMember.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                  <SelectItem value="REVIEWER">{t("roleReviewer")}</SelectItem>
                  <SelectItem value="VIEWER">{t("roleViewer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
