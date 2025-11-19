import { requireRole } from "@/lib/auth/server-auth";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import { ArrowLeft, CheckCircle, Clock, XCircle, Building2, Mail, Phone, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getPendingSchools() {
  const db = getAdminDb();
  
  try {
    const snapshot = await db
      .collection("universities")
      .where("status", "==", "PENDING")
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching pending schools:", error);
    return [];
  }
}

async function getRecentlyApprovedSchools() {
  const db = getAdminDb();
  
  try {
    const snapshot = await db
      .collection("universities")
      .where("status", "==", "APPROVED")
      .orderBy("approvedAt", "desc")
      .limit(5)
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching approved schools:", error);
    return [];
  }
}

export default async function AdminSchoolSetupPage() {
  await requireRole(["ADMIN"]);
  
  const t = await getTranslations("admin.schools.setup");
  const [pendingSchools, recentlyApproved] = await Promise.all([
    getPendingSchools(),
    getRecentlyApprovedSchools(),
  ]);

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

      {/* Pending Approvals */}
      {pendingSchools.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <CardTitle>{t("pendingApprovalsCount", { count: pendingSchools.length })}</CardTitle>
            </div>
            <CardDescription>{t("pendingApprovalsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSchools.map((school: any) => (
                <div key={school.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{school.name}</h3>
                      <p className="text-sm text-muted-foreground">{school.city}, {school.country}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-100">{t("pending")}</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
                    {school.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{school.email}</span>
                      </div>
                    )}
                    {school.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{school.phone}</span>
                      </div>
                    )}
                    {school.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {school.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {school.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {school.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/admin/universities?review=${school.id}`}>
                        {t("reviewAndApprove")}
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/schools/${school.id}/setup`}>
                        {t("setupGuide")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Checklist Template */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("schoolOnboardingChecklist")}</CardTitle>
          <CardDescription>{t("schoolOnboardingChecklistDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step1")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step1Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step2")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step2Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step3")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step3Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step4")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step4Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step5")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step5Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  6
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step6")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step6Desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                  7
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{t("step7")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("step7Desc")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Approved Schools */}
      {recentlyApproved.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle>{t("recentlyApprovedSchools")}</CardTitle>
            </div>
            <CardDescription>{t("recentlyApprovedDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyApproved.map((school: any) => (
                <div key={school.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.city}, {school.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t("approved")}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/schools/${school.id}/setup`}>
                        {t("viewSetup")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
