import { getServerUser } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/components/settings/ProfileForm";
import PasskeyManager from "@/components/settings/PasskeyManager";
import DeleteAccount from "@/components/settings/DeleteAccount";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientAuthSync } from "@/components/ClientAuthSync";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    const signinPath = locale === "en" ? "/auth/signin" : `/${locale}/auth/signin`;
    redirect(signinPath);
  }

  const t = await getTranslations("settings");

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientAuthSync />
      
      <div className="max-w-4xl mx-auto">
        <EmailVerificationBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">{t("profileTab")}</TabsTrigger>
            <TabsTrigger value="security">{t("securityTab")}</TabsTrigger>
            <TabsTrigger value="account">{t("accountTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profileInfo")}</CardTitle>
                <CardDescription>{t("profileInfoDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("passkeys")}</CardTitle>
                <CardDescription>{t("passkeysDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <PasskeyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("dangerZone")}</CardTitle>
                <CardDescription>{t("dangerZoneDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteAccount />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
