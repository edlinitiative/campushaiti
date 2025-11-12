import { useTranslations } from "next-intl";
import EmailLinkAuth from "@/components/auth/EmailLinkAuth";
import PasskeyAuth from "@/components/auth/PasskeyAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInPage() {
  const t = useTranslations("auth");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("welcome")}</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email Link</TabsTrigger>
                <TabsTrigger value="passkey">Passkey</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="mt-4">
                <EmailLinkAuth />
              </TabsContent>
              <TabsContent value="passkey" className="mt-4">
                <PasskeyAuth />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
