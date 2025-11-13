import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientAuthSync } from "@/components/ClientAuthSync";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const t = await getTranslations("dashboard");

  // Fetch applications server-side
  let applications: any[] = [];
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection("applications")
      .where("applicantUid", "==", user.uid)
      .limit(20)
      .get();
    
    applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching applications:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientAuthSync />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">Manage your university applications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("myApplications")}</CardTitle>
            <CardDescription>Track your application status</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No applications yet</p>
                <Link href="/apply">
                  <Button>Start Application</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Application #{app.id.slice(0, 8)}</span>
                      <Badge>{t(`status.${app.status}`)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("myDocuments")}</CardTitle>
            <CardDescription>View uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/documents">
              <Button variant="outline" className="w-full">View Documents</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("myProfile")}</CardTitle>
            <CardDescription>Update your information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
