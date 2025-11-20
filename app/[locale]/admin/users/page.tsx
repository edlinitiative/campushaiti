import { requireRole } from "@/lib/auth/server-auth";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { ArrowLeft, Shield } from "lucide-react";
import UsersListClient from "@/components/admin/UsersListClient";

async function getUserStats() {
  try {
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users;
    
    const googleUsers = users.filter((u) => 
      u.providerData.some((p) => p.providerId === "google.com")
    ).length;
    
    const passwordUsers = users.filter((u) =>
      u.providerData.some((p) => p.providerId === "password")
    ).length;
    
    const phoneUsers = users.filter((u) =>
      u.providerData.some((p) => p.providerId === "phone")
    ).length;
    
    return {
      total: users.length,
      google: googleUsers,
      password: passwordUsers,
      phone: phoneUsers,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      total: 0,
      google: 0,
      password: 0,
      phone: 0,
    };
  }
}

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);

  const t = await getTranslations("admin.users");
  const stats = await getUserStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToDashboard")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalUsers")}</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("googleUsers")}</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {stats.google}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("passwordUsers")}</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.password}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("phoneUsers")}</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {stats.phone}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users List */}
      <UsersListClient />

      {/* Role Management Info */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>{t("rolePermissions")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-red-800">{t("admin")}</p>
              <p className="text-muted-foreground">
                {t("adminDesc")}
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-800">{t("schoolAdmin")}</p>
              <p className="text-muted-foreground">
                {t("schoolAdminDesc")}
              </p>
            </div>
            <div>
              <p className="font-medium">{t("applicant")}</p>
              <p className="text-muted-foreground">
                {t("applicantDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
