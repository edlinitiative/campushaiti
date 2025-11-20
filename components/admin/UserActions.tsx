"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Ban, CheckCircle, Mail, Key, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserActionsProps {
  user: any;
  onUpdate: () => void;
}

export default function UserActions({ user, onUpdate }: UserActionsProps) {
  const t = useTranslations("admin.users");
  const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDisableUser = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, disabled: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to disable user");
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleEnableUser = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, disabled: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to enable user");
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      alert(t("passwordResetSent"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {user.disabled ? (
            <DropdownMenuItem onClick={() => setAction("enable")}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("enableAccount")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setAction("disable")}>
              <Ban className="w-4 h-4 mr-2" />
              {t("disableAccount")}
            </DropdownMenuItem>
          )}
          
          {user.providerData?.some((p: any) => p.providerId === "password") && (
            <DropdownMenuItem onClick={() => setAction("reset-password")}>
              <Key className="w-4 h-4 mr-2" />
              {t("resetPassword")}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setAction("delete")}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("deleteUser")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Disable User Dialog */}
      <AlertDialog open={action === "disable"} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("disableUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("disableUserDescription", { email: user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableUser} disabled={loading}>
              {loading ? t("processing") : t("disable")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enable User Dialog */}
      <AlertDialog open={action === "enable"} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("enableUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("enableUserDescription", { email: user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnableUser} disabled={loading}>
              {loading ? t("processing") : t("enable")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={action === "reset-password"} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetPasswordTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("resetPasswordDescription", { email: user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={loading}>
              {loading ? t("processing") : t("sendResetEmail")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={action === "delete"} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteUserDescription", { email: user.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? t("processing") : t("deleteUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
